"""
services/ml_analyzer.py
ML-аналізатор для DreamWork.

Використовує попередні дані симуляцій (expected_income, roi, input_data)
для побудови моделі LinearRegression та прогнозування результатів.

Усі дані серіалізуються у bytes (pickle) для ефективного
зберігання/кешування моделі в оперативній памʼяті.
"""

import pickle
import struct
import io
import sys
from typing import Optional

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler


class DataPacker:
    """
    Утиліта для серіалізації/десеріалізації даних у bytes.
    Зменшує споживання памʼяті порівняно з JSON/dict.
    """

    @staticmethod
    def features_to_bytes(features: list[list[float]]) -> bytes:
        """
        Пакує 2D список float у компактні bytes через struct.
        Формат: [n_rows:uint32][n_cols:uint32][row0_col0:double][row0_col1:double]...
        """
        if not features:
            return b""

        n_rows = len(features)
        n_cols = len(features[0])

        # Header: кількість рядків та колонок (uint32)
        buf = struct.pack("<II", n_rows, n_cols)

        # Дані: кожне значення як double (8 bytes)
        for row in features:
            buf += struct.pack(f"<{n_cols}d", *row)

        return buf

    @staticmethod
    def bytes_to_features(data: bytes) -> list[list[float]]:
        """Розпаковує bytes назад у 2D список."""
        if not data:
            return []

        offset = 0
        n_rows, n_cols = struct.unpack_from("<II", data, offset)
        offset += 8  # 2 × uint32

        features = []
        row_size = n_cols * 8  # кожен double = 8 bytes
        for _ in range(n_rows):
            row = list(struct.unpack_from(f"<{n_cols}d", data, offset))
            features.append(row)
            offset += row_size

        return features

    @staticmethod
    def labels_to_bytes(labels: list[float]) -> bytes:
        """Пакує 1D список float у bytes."""
        n = len(labels)
        return struct.pack(f"<I{n}d", n, *labels)

    @staticmethod
    def bytes_to_labels(data: bytes) -> list[float]:
        """Розпаковує bytes у 1D список."""
        if not data:
            return []
        n = struct.unpack_from("<I", data, 0)[0]
        return list(struct.unpack_from(f"<{n}d", data, 4))

    @staticmethod
    def model_to_bytes(model) -> bytes:
        """Серіалізує sklearn модель у bytes через pickle."""
        return pickle.dumps(model)

    @staticmethod
    def bytes_to_model(data: bytes):
        """Десеріалізує sklearn модель з bytes."""
        return pickle.loads(data)

    @staticmethod
    def get_size_info(data: bytes) -> dict:
        """Повертає розмір даних у байтах та людиночитаному форматі."""
        size_bytes = len(data)
        if size_bytes < 1024:
            human = f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            human = f"{size_bytes / 1024:.1f} KB"
        else:
            human = f"{size_bytes / (1024 * 1024):.1f} MB"
        return {"bytes": size_bytes, "human_readable": human}


class CareerMLAnalyzer:
    """
    ML-модель для аналізу кар'єрних даних.

    Тренується на попередніх симуляціях (Simulation records)
    і прогнозує:
      - expected_income (очікувана зарплата)
      - roi (повернення інвестицій часу)
    """

    def __init__(self):
        self.income_model: Optional[LinearRegression] = None
        self.roi_model: Optional[LinearRegression] = None
        self.scaler: Optional[StandardScaler] = None

        # Кешовані моделі у байтах
        self._cached_income_bytes: Optional[bytes] = None
        self._cached_roi_bytes: Optional[bytes] = None
        self._cached_scaler_bytes: Optional[bytes] = None

        # Кешовані дані тренування у байтах
        self._training_features_bytes: Optional[bytes] = None
        self._training_income_bytes: Optional[bytes] = None
        self._training_roi_bytes: Optional[bytes] = None

        self.is_trained = False
        self.packer = DataPacker()

    def _extract_features(self, simulation_records: list[dict]) -> tuple[list[list[float]], list[float], list[float]]:
        """
        Витягує фічі з записів симуляцій.

        Фічі (X):
          - hours_per_week
          - кількість поточних навичок
          - target_income
          - кількість відсутніх навичок

        Лейбли (y):
          - expected_income
          - roi
        """
        features = []
        incomes = []
        rois = []

        for record in simulation_records:
            input_data = record.get("input_data", {})
            hours = float(input_data.get("hours_per_week", 10))
            n_skills = float(len(input_data.get("current_skills", [])))
            target = float(input_data.get("current_income", 50000))
            n_missing = float(len(record.get("result_data", {}).get("recommended_skills", [])))

            features.append([hours, n_skills, target, n_missing])
            incomes.append(float(record.get("expected_income", 0)))
            rois.append(float(record.get("roi", 0)))

        return features, incomes, rois

    def train(self, simulation_records: list[dict]) -> dict:
        """
        Тренує ML-моделі на попередніх записах симуляцій.

        Конвертує всі дані в bytes для мінімального використання памʼяті.
        Повертає інфо по розміру.
        """
        if len(simulation_records) < 2:
            return {
                "status": "insufficient_data",
                "message": "Потрібно мінімум 2 записи симуляцій для тренування.",
                "records_count": len(simulation_records),
            }

        features, incomes, rois = self._extract_features(simulation_records)

        # Зберігаємо тренувальні дані в bytes
        self._training_features_bytes = self.packer.features_to_bytes(features)
        self._training_income_bytes = self.packer.labels_to_bytes(incomes)
        self._training_roi_bytes = self.packer.labels_to_bytes(rois)

        X = np.array(features)
        y_income = np.array(incomes)
        y_roi = np.array(rois)

        # Нормалізація
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        # Тренування моделей
        self.income_model = LinearRegression()
        self.income_model.fit(X_scaled, y_income)

        self.roi_model = LinearRegression()
        self.roi_model.fit(X_scaled, y_roi)

        # Кешуємо моделі у bytes
        self._cached_income_bytes = self.packer.model_to_bytes(self.income_model)
        self._cached_roi_bytes = self.packer.model_to_bytes(self.roi_model)
        self._cached_scaler_bytes = self.packer.model_to_bytes(self.scaler)

        self.is_trained = True

        return {
            "status": "trained",
            "records_used": len(simulation_records),
            "features_count": len(features[0]),
            "memory_usage": {
                "income_model": self.packer.get_size_info(self._cached_income_bytes),
                "roi_model": self.packer.get_size_info(self._cached_roi_bytes),
                "scaler": self.packer.get_size_info(self._cached_scaler_bytes),
                "training_features": self.packer.get_size_info(self._training_features_bytes),
                "training_labels_income": self.packer.get_size_info(self._training_income_bytes),
                "training_labels_roi": self.packer.get_size_info(self._training_roi_bytes),
            },
        }

    def predict(self, hours_per_week: float, n_current_skills: int, target_income: float, n_missing_skills: int) -> dict:
        """
        Прогнозує expected_income та roi на основі вхідних параметрів.

        Якщо модель не натренована — повертає помилку.
        Якщо моделі закешовані в bytes — відновлює їх з кешу.
        """
        if not self.is_trained:
            return {
                "status": "not_trained",
                "message": "Модель ще не натренована. Виконайте /ai/train спочатку.",
            }

        # Відновлюємо моделі з bytes-кешу якщо потрібно
        if self.income_model is None and self._cached_income_bytes:
            self.income_model = self.packer.bytes_to_model(self._cached_income_bytes)
        if self.roi_model is None and self._cached_roi_bytes:
            self.roi_model = self.packer.bytes_to_model(self._cached_roi_bytes)
        if self.scaler is None and self._cached_scaler_bytes:
            self.scaler = self.packer.bytes_to_model(self._cached_scaler_bytes)

        features = np.array([[hours_per_week, n_current_skills, target_income, n_missing_skills]])
        features_scaled = self.scaler.transform(features)

        predicted_income = round(float(self.income_model.predict(features_scaled)[0]), 2)
        predicted_roi = round(float(self.roi_model.predict(features_scaled)[0]), 2)

        # Розмір вхідних даних у bytes
        input_bytes = self.packer.features_to_bytes(features.tolist())

        return {
            "status": "ok",
            "predicted_income": predicted_income,
            "predicted_roi": predicted_roi,
            "input_size": self.packer.get_size_info(input_bytes),
        }

    def get_model_bytes(self) -> Optional[bytes]:
        """Повертає обидві моделі + скейлер запаковані в один bytes blob."""
        if not self.is_trained:
            return None

        bundle = {
            "income_model": self._cached_income_bytes,
            "roi_model": self._cached_roi_bytes,
            "scaler": self._cached_scaler_bytes,
        }
        return pickle.dumps(bundle)

    def load_model_bytes(self, data: bytes):
        """Завантажує моделі з bytes blob."""
        bundle = pickle.loads(data)
        self._cached_income_bytes = bundle["income_model"]
        self._cached_roi_bytes = bundle["roi_model"]
        self._cached_scaler_bytes = bundle["scaler"]
        self.income_model = self.packer.bytes_to_model(self._cached_income_bytes)
        self.roi_model = self.packer.bytes_to_model(self._cached_roi_bytes)
        self.scaler = self.packer.bytes_to_model(self._cached_scaler_bytes)
        self.is_trained = True


# Глобальний екземпляр аналізатора
analyzer = CareerMLAnalyzer()

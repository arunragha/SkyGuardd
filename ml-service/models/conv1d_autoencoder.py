"""
SkyGuard Conv1D Deep Autoencoder for Temporal Sensor Anomaly Detection
Implemented in PyTorch with 1D Convolutional Encoder-Decoder architecture.
"""

import os
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from typing import Tuple, Dict, Any, List

class Conv1DAutoencoderModel(nn.Module):
    def __init__(self, in_features: int = 10, latent_dim: int = 4):
        super(Conv1DAutoencoderModel, self).__init__()
        
        # Encoder: compresses multi-channel temporal sensor representations
        self.encoder = nn.Sequential(
            nn.Conv1d(in_channels=in_features, out_channels=16, kernel_size=1),
            nn.BatchNorm1d(16),
            nn.LeakyReLU(0.2),
            nn.Conv1d(in_channels=16, out_channels=latent_dim, kernel_size=1),
            nn.BatchNorm1d(latent_dim),
            nn.LeakyReLU(0.2)
        )
        
        # Decoder: reconstructs normal physical correlations
        self.decoder = nn.Sequential(
            nn.ConvTranspose1d(in_channels=latent_dim, out_channels=16, kernel_size=1),
            nn.BatchNorm1d(16),
            nn.LeakyReLU(0.2),
            nn.ConvTranspose1d(in_channels=16, out_channels=in_features, kernel_size=1)
        )

    def forward(self, x):
        # x shape: (batch_size, in_features, 1)
        latent = self.encoder(x)
        reconstruction = self.decoder(latent)
        return reconstruction

class Conv1DAutoencoderDetector:
    def __init__(self, in_features: int = 10, latent_dim: int = 4, lr: float = 0.005, epochs: int = 15):
        self.in_features = in_features
        self.latent_dim = latent_dim
        self.lr = lr
        self.epochs = epochs
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = Conv1DAutoencoderModel(in_features, latent_dim).to(self.device)
        self.threshold = 0.50
        self.is_trained = False

    def fit(self, X_train: np.ndarray, val_percentile: float = 98.0) -> Dict[str, Any]:
        """Train autoencoder exclusively on normal baseline observations"""
        self.model.train()
        criterion = nn.MSELoss()
        optimizer = optim.Adam(self.model.parameters(), lr=self.lr, weight_decay=1e-5)
        
        # Format for Conv1D: (N, C, L) where C = features, L = 1
        X_tensor = torch.tensor(X_train, dtype=torch.float32).unsqueeze(2).to(self.device)
        dataset = torch.utils.data.TensorDataset(X_tensor)
        loader = torch.utils.data.DataLoader(dataset, batch_size=64, shuffle=True)

        loss_history = []
        for epoch in range(self.epochs):
            total_loss = 0.0
            for batch in loader:
                inputs = batch[0]
                optimizer.zero_grad()
                outputs = self.model(inputs)
                loss = criterion(outputs, inputs)
                loss.backward()
                optimizer.step()
                total_loss += loss.item() * len(inputs)
            
            epoch_loss = total_loss / len(X_train)
            loss_history.append(epoch_loss)

        # Calibrate dynamic reconstruction error threshold on train/val
        self.model.eval()
        with torch.no_grad():
            recon = self.model(X_tensor)
            errors = torch.mean((X_tensor - recon) ** 2, dim=[1, 2]).cpu().numpy()
            self.threshold = float(np.percentile(errors, val_percentile))

        self.is_trained = True
        return {
            "final_epoch_loss": float(loss_history[-1]),
            "calibrated_threshold": self.threshold,
            "loss_history": [float(l) for l in loss_history]
        }

    def predict_errors_and_scores(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Compute reconstruction error per sample, normalized anomaly score (0.0 to 1.0),
        and feature-level errors for root-cause diagnosis.
        """
        self.model.eval()
        X_tensor = torch.tensor(X, dtype=torch.float32).unsqueeze(2).to(self.device)
        
        with torch.no_grad():
            recon = self.model(X_tensor)
            # Feature-wise squared error: (N, in_features)
            feature_errors = torch.squeeze((X_tensor - recon) ** 2, dim=2).cpu().numpy()
            sample_errors = np.mean(feature_errors, axis=1)

        # Non-linear logistic sigmoid normalization around calibrated threshold
        # Scale factor ensures smooth continuous 0.0 - 1.0 mapping
        scale = max(0.01, self.threshold)
        z = (sample_errors - self.threshold) / scale
        scores = 1.0 / (1.0 + np.exp(-1.5 * z))
        binary_preds = (sample_errors > self.threshold).astype(int)

        return sample_errors, scores, feature_errors

    def save(self, filepath: str):
        torch.save({
            "model_state": self.model.state_dict(),
            "in_features": self.in_features,
            "latent_dim": self.latent_dim,
            "threshold": self.threshold,
            "is_trained": self.is_trained
        }, filepath)

    def load(self, filepath: str):
        checkpoint = torch.load(filepath, map_location=self.device)
        self.in_features = checkpoint["in_features"]
        self.latent_dim = checkpoint["latent_dim"]
        self.threshold = checkpoint["threshold"]
        self.model = Conv1DAutoencoderModel(self.in_features, self.latent_dim).to(self.device)
        self.model.load_state_dict(checkpoint["model_state"])
        self.is_trained = checkpoint["is_trained"]
        self.model.eval()

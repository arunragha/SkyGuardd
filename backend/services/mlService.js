import { config } from '../config/index.js';

export const mlService = {
  callEndpoint: async (endpoint, options = {}, timeoutMs = 12000) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${config.mlServiceUrl}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        ...options
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`ML microservice error (${res.status}): ${errorBody}`);
      }
      return await res.json();
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error(`ML microservice request timed out after ${timeoutMs}ms on ${endpoint}`);
      }
      throw err;
    }
  },

  checkHealth: async () => {
    try {
      return await mlService.callEndpoint('/health', { method: 'GET' }, 3000);
    } catch (err) {
      return {
        status: 'unreachable',
        error: err.message,
        url: config.mlServiceUrl
      };
    }
  },

  predictSingle: async (reading) => {
    return await mlService.callEndpoint('/predict/single', {
      method: 'POST',
      body: JSON.stringify(reading)
    });
  },

  predictBatch: async (readings) => {
    return await mlService.callEndpoint('/predict', {
      method: 'POST',
      body: JSON.stringify({ readings })
    });
  },

  getBenchmarks: async () => {
    return await mlService.callEndpoint('/benchmarks', { method: 'GET' });
  },

  retrainModel: async (modelName) => {
    return await mlService.callEndpoint('/train', {
      method: 'POST',
      body: JSON.stringify({ model_name: modelName })
    }, 45000); // 45s timeout for deep learning retraining
  },

  selectModel: async (modelName) => {
    return await mlService.callEndpoint('/select_model', {
      method: 'POST',
      body: JSON.stringify({ model_name: modelName })
    });
  }
};

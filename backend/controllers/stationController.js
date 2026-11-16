import { stationRepository } from '../db/repositories/stationRepository.js';

export const stationController = {
  getAll: (req, res, next) => {
    try {
      const stations = stationRepository.getAll();
      res.json({ success: true, count: stations.length, stations });
    } catch (err) {
      next(err);
    }
  },

  getById: (req, res, next) => {
    try {
      const station = stationRepository.getById(req.params.id);
      if (!station) {
        return res.status(404).json({ success: false, message: 'Station not found.' });
      }
      res.json({ success: true, station });
    } catch (err) {
      next(err);
    }
  },

  create: (req, res, next) => {
    try {
      const { name, code, location, region, lat, lng, elevation, sensorCount } = req.body;
      const newStation = stationRepository.create({
        name,
        code,
        location,
        region,
        lat: parseFloat(lat) || 45.0,
        lng: parseFloat(lng) || -120.0,
        elevation: parseFloat(elevation) || 150,
        sensorCount: parseInt(sensorCount, 10) || 16
      });
      res.status(201).json({ success: true, station: newStation });
    } catch (err) {
      next(err);
    }
  }
};

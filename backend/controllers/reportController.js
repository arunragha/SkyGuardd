import { reportService } from '../services/reportService.js';

export const reportController = {
  getSummary: (req, res, next) => {
    try {
      const summary = reportService.getExecutiveSummary();
      res.json({ success: true, summary });
    } catch (err) {
      next(err);
    }
  },

  exportAnomaliesCSV: (req, res, next) => {
    try {
      const csv = reportService.exportAnomaliesCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="skyguard-anomalies-${Date.now()}.csv"`);
      res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  },

  exportModelsCSV: (req, res, next) => {
    try {
      const csv = reportService.exportModelsCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="skyguard-models-benchmarks-${Date.now()}.csv"`);
      res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  }
};

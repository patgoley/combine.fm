import path from 'path';
import fs from 'fs';

const services = [];

fs.readdirSync(path.join(__dirname, 'services')).forEach((file) => {
  const service = require(path.join(__dirname, 'services', file));
  if (service.search) {
    services.push(service);
  }
});

export default services;

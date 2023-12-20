const fs = require('fs');
const path = require('path');
const findRoot = require('find-root');
const projectRoot = findRoot(__dirname);

function saveData(data, file) {
  if (fs.existsSync(path.join(projectRoot, `/data/${file}.json`))) {
    fs.writeFileSync(path.join(projectRoot, `/data/${file}.json`), JSON.stringify(data, null, 2));
  } else {
    fs.writeFileSync(path.join(projectRoot, `/data/${file}.json`), JSON.stringify(data, null, 2));
  }
}

function readData(file) {
  console.log(projectRoot);
  console.log(__filename);
  console.log(projectRoot);
  
  if (fs.existsSync(path.join(projectRoot, `/data/${file}.json`))) {
    const data = fs.readFileSync(path.join(projectRoot, `/data/${file}.json`), 'utf8');
    if (data !== ''){
      return JSON.parse(data);
    } else {
      return [];
    }
    
  } 
  return [];
}

exports.io = {
  saveData: saveData,
  readData: readData
}
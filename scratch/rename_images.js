const fs = require('fs');
const path = require('path');

const srcFolder = path.join(__dirname, '../public/assets/images/products/do-noi-that');

const files = fs.readdirSync(srcFolder);

files.forEach(file => {
  let newName = file;
  if (file === 'bàn2.jpg') newName = 'ban-2.jpg';
  else if (file === 'bàn3.jpg') newName = 'ban-3.jpg';
  else if (file === 'bàn4.jpg') newName = 'ban-4.jpg';
  else if (file === 'tải xuống.jpg') newName = 'ban-5.jpg';
  else if (file.toLowerCase().includes('ghế')) {
    if (file.includes('1')) newName = 'ghe-1.jpg';
    else if (file.includes('2')) newName = 'ghe-2.jpg';
    else if (file.includes('3')) newName = 'ghe-3.jpg';
    else if (file.includes('4')) newName = 'ghe-4.jpg';
    else if (file.includes('5')) newName = 'ghe-5.jpg';
  } else if (file.toLowerCase().includes('giường')) {
    if (file.includes('1')) newName = 'giuong-1.jpg';
    else if (file.includes('2')) newName = 'giuong-2.jpg';
    else if (file.includes('3')) newName = 'giuong-3.jpg';
    else if (file.includes('4')) newName = 'giuong-4.jpg';
    else if (file.includes('5')) newName = 'giuong-5.jpg';
  } else if (file.toLowerCase().includes('rèm')) {
    if (file.includes('1')) newName = 'rem-1.jpg';
    else if (file.includes('2')) newName = 'rem-2.jpg';
    else if (file.includes('3')) newName = 'rem-3.jpg';
    else if (file.includes('4')) newName = 'rem-4.jpg';
    else if (file.includes('5')) newName = 'rem-5.jpg';
  } else if (file.toLowerCase().includes('tủ kệ')) {
    if (file.includes('1')) newName = 'tu-ke-1.jpg';
    else if (file.includes('2')) newName = 'tu-ke-2.jpg';
    else if (file.includes('3')) newName = 'tu-ke-3.jpg';
    else if (file.includes('4')) newName = 'tu-ke-4.jpg';
    else if (file.includes('5')) newName = 'tu-ke-5.jpg';
  } else if (file.toLowerCase().startsWith('tủ')) {
    if (file.includes('1')) newName = 'tu-lavabo-1.jpg';
    else if (file.includes('2')) newName = 'tu-lavabo-2.jpg';
    else if (file.includes('3')) newName = 'tu-lavabo-3.jpg';
    else if (file.includes('4')) newName = 'tu-lavabo-4.jpg';
    else if (file.includes('5')) newName = 'tu-lavabo-5.jpg';
  }

  if (newName !== file) {
    fs.renameSync(path.join(srcFolder, file), path.join(srcFolder, newName));
    console.log(`Renamed: ${file} -> ${newName}`);
  }
});

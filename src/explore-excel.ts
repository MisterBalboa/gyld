const XLSX = require('xlsx');

function exploreExcel() {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile('data/level_a_players.xlsx');
    
    console.log('Sheet names:', workbook.SheetNames);
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Get the range of the sheet
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    console.log('Sheet range:', range);
    
    // Get headers (first row)
    const headers: string[] = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      const cell = worksheet[cellAddress];
      headers.push(cell ? cell.v : `Column${col + 1}`);
    }
    console.log('Headers:', headers);
    
    // Convert to JSON to see the data structure
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log('Number of rows:', jsonData.length);
    console.log('First row:', jsonData[0]);
    console.log('Second row:', jsonData[1]);
    
  } catch (error) {
    console.error('Error reading Excel file:', error);
  }
}

exploreExcel();

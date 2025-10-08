export function exportCompletedNumbersCSV(completedNumbers: string[]): void {
  if (completedNumbers.length === 0) {
    alert('No completed numbers to export');
    return;
  }

  // Create CSV content
  const csvContent = [
    'Phone Number,PC Status,Date Completed',
    ...completedNumbers.map(number => 
      `${number},Yes,${new Date().toISOString().split('T')[0]}`
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `completed_contacts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportForZohoImport(completedNumbers: string[]): void {
  if (completedNumbers.length === 0) {
    alert('No completed numbers to export');
    return;
  }

  // Zoho CRM import format
  const csvContent = [
    'Mobile,PC',
    ...completedNumbers.map(number => `${number},Yes`)
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `zoho_import_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
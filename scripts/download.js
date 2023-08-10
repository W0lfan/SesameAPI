function DownLoad(url, name) {
    fetch(url)
    .then(response => response.text())
    .then(data => {
        var fileContent = data;
        var fileName = `${__NAME__} - ${name}`;

                
        var fileBlob = new Blob([fileContent], { type: 'text' });

        var downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(fileBlob);
        downloadLink.download = fileName;
        downloadLink.click();

        URL.revokeObjectURL(downloadLink.href);
})
    .catch(error => {
        console.error('Error fetching file:', error);
        alert('An error occured. Please join the Discord server in order to report it.')
    });
}
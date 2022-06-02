let db;

const request = indexedDB.open('Track_Cash', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;

    db.createObjectStore('new_transaction', { autoIncrement: true })
}

request.onsuccess = (event) => {
    db = event.target.result;

    if (navigator.onLine) {
        uploadTransaction();
    }
}

request.onerror = function (event) {

    console.log(event.target.errorCode);
};


function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const moneyObjectStore = transaction.objectStore('new_transaction');

    moneyObjectStore.add(record)
}

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
  
    const moneyObjectStore = transaction.objectStore('new_transaction');

    const getAll = moneyObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    const moneyObject = transaction.objectStore('new_transaction');

                    moneyObject.clear();
                })
                .catch(err => {

                    console.log(err)
                })
        }
    }
}

window.addEventListener('online', uploadTransaction)
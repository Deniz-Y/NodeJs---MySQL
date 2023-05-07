
function getDiffLang() {

    const country1 = document.getElementById('country1').value;
    const country2 = document.getElementById('country2').value;

    const body = document.getElementById("resultBody");
    body.innerHTML = "";

    fetch(`http://localhost:3000/getDiffLang?country1=${country1}&country2=${country2}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {

                    data.forEach(language => {
                      const row = body.insertRow();
                      const cell = row.insertCell();
                        cell.textContent = language.language;  
                    });

            } else {
                const row = body.insertRow();
                const cell = row.insertCell();
                cell.textContent = 'No languages found.';
            }
                    
        })
        .catch(error => console.error(error));
};


function getDiffLangJoin() {

    const country1 = document.getElementById('country1').value;
    const country2 = document.getElementById('country2').value;

    const body = document.getElementById("resultBody");
    body.innerHTML = "";

    fetch(`http://localhost:3000/getDiffLang?country1=${country1}&country2=${country2}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {

                data.forEach(language => {
                    console.log(language);
                    const row = body.insertRow();
                    const cell = row.insertCell();
                    cell.textContent = language.language;

                });

            } else {
                const row = body.insertRow();
                const cell = row.insertCell();
                cell.textContent = 'No languages found.';
            }

        })
        .catch(error => console.error(error));
};

function getAggregateCountries() {

    // Get the input values
   
    var agg_type = document.getElementById("agg_type").value;
    var country_name = document.getElementById("country_name").value;
    const body = document.getElementById("resultBody");
    body.innerHTML = "";

    fetch(`http://localhost:3000/aggregateCountries?agg_type=${agg_type}&country_name=${country_name}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                data.forEach(country => {

                    const row = body.insertRow();
                    const NameCell = row.insertCell(0);
                    var lifeExpectancyCell = row.insertCell(1);
                    var governmentFormCell = row.insertCell(2);
                    var languageCell = row.insertCell(3);
                    NameCell.innerText = country.Name;
                    lifeExpectancyCell.innerText = country.LifeExpectancy;
                    governmentFormCell.innerText = country.GovernmentForm;
                    languageCell.innerText = country.Language;
                });

            } else {
                const row = body.insertRow();
                const cell = row.insertCell();
                cell.textContent = 'No countries found.';
            }

        })
        .catch(error => console.error(error));
};
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

const app = express();

// Enable CORS
app.use(cors());

// Configure body-parser to handle POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Create a MySQL connection pool
const pool = mysql.createPool({
   host: 'localhost',
   user: 'root',
   password: 'Deniz.1999',
   database: 'world',
});


function contains(val, col_name, table_name) {


    const sql = `SELECT COUNT(*) as count FROM ${table_name} WHERE ${col_name} = '${val}'`;
    pool.query(sql, (error, results) => {
        if (error) {
            throw error;
        } else {
            const count = results[0].count;
            if (count > 0) {
                console.log(val + " " + col_name + " " + table_name + ": "+"True");
            } else {
                console.log(val + " " + col_name + " " + table_name + ": " + "False");
            }
        }
    });
}
contains("AFK", "countryCode", "city") // should return false
contains("AFG", "countryCode", "city"); // should return true


function diff_lang(country1, country2,callback) {
  
    const sql_query = `SELECT DISTINCT language 
                    FROM countrylanguage 
                    JOIN country ON countrylanguage.countryCode = country.code 
                    WHERE country.name = '${country1}' AND language NOT IN 
                    (SELECT language 
                    FROM countrylanguage 
                    JOIN country ON countrylanguage.countryCode = country.code 
                    WHERE country.name = '${country2}')`;

    pool.query(sql_query, (error, results) => {
     if (error) {
         callback(error, null);
     } else {
       callback(null, results);
      }
    });
}

module.exports = {
    diff_lang_join,
    diff_lang,
    aggregate_countries
};

function diff_lang_join(country1, country2, callback) {

    const sql_query = `SELECT DISTINCT cl1.Language
          FROM countrylanguage cl1
          LEFT JOIN countrylanguage cl2 ON cl1.Language = cl2.Language AND cl2.CountryCode = (SELECT Code FROM country WHERE Name = '${country2}')
          WHERE cl1.CountryCode = (SELECT Code FROM country WHERE Name = '${country1}') AND cl2.Language IS NULL;`;

    pool.query(sql_query, (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
}


function aggregate_countries(agg_type, country_name, callback) {

    const sql_query =`SELECT country.Name, country.LifeExpectancy, country.GovernmentForm, countrylanguage.Language 
                FROM country, countrylanguage
                WHERE country.Code = countrylanguage.CountryCode AND LifeExpectancy > ${
           agg_type === "AVG" ? "(SELECT AVG(LifeExpectancy) FROM country)" : "(SELECT MIN(LifeExpectancy) FROM country)"
        } AND LifeExpectancy < (SELECT LifeExpectancy FROM country WHERE Name = '${country_name}')
                ORDER BY LifeExpectancy DESC`;

    pool.query(sql_query, (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            callback(null, results);
        }
    });


}

function find_min_max_continent() {

    const sql_query = `     
            SELECT c1.Continent, c1.Name, c1.LifeExpectancy
            FROM Country c1
            WHERE 
            (c1.LifeExpectancy IN (
            SELECT MIN(LifeExpectancy) FROM Country WHERE Continent = c1.Continent
             ) OR c1.LifeExpectancy IN (
             SELECT MAX(LifeExpectancy) FROM Country WHERE Continent = c1.Continent
             ))
            ORDER BY c1.Continent ASC, c1.LifeExpectancy DESC;`; 

     /*
     SELECT Continent, MIN(Name) AS MinCountry, MIN(LifeExpectancy) AS MinLifeExpectancy, MAX(Name) AS MaxCountry, MAX(LifeExpectancy) AS MaxLifeExpectancy
     FROM country 
     GROUP BY
     Continent
     
*/

    pool.query(sql_query, (error, results) => {
        if (error) {

        } else {
            console.log(results);
        }
    });
}

find_min_max_continent();


function find_country_languages(percentage, language) {

    const sql_query = `     
       SELECT Name, Language, Percentage 
       FROM countrylanguage 
       JOIN country ON countrylanguage.countryCode = country.Code
       WHERE Language = '${language}' AND Percentage >= '${percentage}'
       ORDER BY Name ASC;`;

    pool.query(sql_query, (error, results) => {
        if (error) {
            // callback(error, null);
        } else {
            console.log(results);
            //callback(null, results);
        }
    });
}

find_country_languages(85, "Turkish");

function find_country_count(amount) {

    const sql_query = `     
        SELECT MAX(country.Name) AS CountryName, MAX(country.LifeExpectancy) AS MaxLifeExpectancy, country.Continent AS Continent
        FROM country
        JOIN (
        SELECT CountryCode, COUNT(*) AS CityCount
        FROM city
        GROUP BY CountryCode
        HAVING CityCount > ${amount}
        ) AS cities ON country.Code = cities.CountryCode
        GROUP BY country.Continent;
         `;

    pool.query(sql_query, (error, results) => {
        if (error) {
            // callback(error, null);
        } else {
            console.log(results);
            //callback(null, results);
        }
    });

}
find_country_count(100);


app.get('/getDiffLang', (req, res) => {

    const country1 = req.query.country1;
    const country2 = req.query.country2;
    diff_lang(country1, country2, (error, results) => {

        if (error) {
            res.status(500).send('Error retrieving data from database');
        } else {
            res.json(results);        
        }
    });

});

app.get('/getDiffLangJoin', (req, res) => {
    const country1 = req.query.country1;
    const country2 = req.query.country2;
    diff_lang_join(country1, country2, (error, results) => {

            if (error) {
                res.status(500).send('Error retrieving data from database');
            } else {
                res.json(results);
            }
    });
});



app.get('/aggregateCountries', (req, res) => {

    const agg_type = req.query.agg_type;
    const country_name = req.query.country_name;

    aggregate_countries(agg_type, country_name, (error, results) => {
        if (error) {
            res.status(500).send('Error retrieving data from database');
        } else {
            res.json(results);
        }   
  });
});
// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
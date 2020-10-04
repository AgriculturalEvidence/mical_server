mongoimport --uri mongodb+srv://admin:admin123@cluster0.5he4u.mongodb.net/Cluster0 --collection interventions --type csv --headerline --file parsingFiles/intervention.csv

mongoimport --uri mongodb+srv://admin:admin123@cluster0.5he4u.mongodb.net/Cluster0 --collection yields --type json --jsonArray --file parsingFiles/yields.json  
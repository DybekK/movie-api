
# Movie API

Movie API is a microservice for creating and fetching movies. The application is written in the **Nest.js** and uses the **MongoDB** document database for data storage.

## How to run for development

1.  Clone this repository and [Auth API](https://github.com/netguru/nodejs-recruitment-task)
2. Go to **Movie API** directory.
```
cd movie-api
```

3. Configure your local.env file 
```
cp local.env .env
# fill the variables with your creativity :) 
```

4.  Run MongoDb:
```
docker-compose up mongodb
```

5. Install dependencies
```
npm install
```

6. Run application with:
 ```
npm run start:dev
 ```

7. Go to **Auth API** repository, set up as in auth-api readme.
8. Configure **JWT_SECRET** in .env files to be the same in both repositories
9. Run application with:
 ```
docker-compose up
 ```
By default the service will start on port  `4200`
 
### Now you can see this app in action! 

1. Generate token. 
```
curl --location -X POST 'localhost:3000/auth' \
-H'Content-Type: application/json' \
-d '{
    "username": "basic-thomas",
    "password": "sR-_pcoow-27-6PAwCD8"
}'
```
2. Copy the token to variable
```
token=yourToken
```
3. Create some movie:
```
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" localhost:4200/movies -d '{"title": "Spiderman"}'
```
4. Get your movies:
```
curl -X GET -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" localhost:4200/movies
```
You should see the Spiderman Movie! 


## How to run containerized app

1. Go to **Movie API** directory.
2. Configure your .env file 
```
cp prod.env .env
# fill the variables with your creativity :) 
```
3.  Build docker image:
```
docker-compose build
```

4. Run **Movie API** and MongoDb with:
 ```
docker-compose up
 ```
By default the service will start on port  `8000`


## How to run tests

> Movie API uses Jest and [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server) for testing

1. Go to **Movie API** directory.
2.  Configure your application, do it like above
3. Run unit tests with:
```
export NODE_ENV=test npm run test
```
4. Run e2e tests with:
```
export NODE_ENV=test npm run test:e2e
``` 

## Documentation
### Add Movie
Creates movie object with details using title provided by user

| URL | Method | Data Params | Headers
| :--- | :--- | :--- | :--- | 
| `/movies` | `POST` | `{ title: string }` | `Authorization: Bearer <token>`
    
-   **Success Response:**
    
    -   **Code:**  200  
    
        **Content:**

		  ```json
	    {
				"message": "movie has been created successfully",
				"data": {
					"_id": "600e11db526b730ac7d45fbd",
					"title": "Spiderman",
					"released": "N/A",
					"genre": "Short",
					"director": "Christian Davi",
					"userId": 123,
					"createdAt": "2021-01-25T00:33:31.767Z",
					"updatedAt": "2021-01-25T00:33:31.767Z",
					"__v": 0
				}
		}
		```
-   **Error Response:**
    
    -   **Code:**  422 UNPROCESSABLE_ENTITY 
    
        **Content:** 
         ```json
         {
				"message": "limit of added movies on the basic account has been exceeded",
				"statusCode": 422
		}
		```
		
	-   **Code:**  400 BAD_REQUEST
	
	**Content:** 
        ```json
        {
			"message": "Movie not found!",
			"statusCode": 400
		}
		```

	
    OR
    
    -   **Code:**  403 FORBIDDEN
    
        **Content:**  
        ```json
        {
			"statusCode": 403,
			"message": "invalid token | jwt must be provided | jwt expired | role is not supported", 
			"error": "Forbidden"
		}
		```
### Get All Movies
Creates movie object with details using title provided by user

| URL | Method | Data Params | Headers
| :--- | :--- | :--- | :--- | 
| `/movies` | `GET` | `{}` | `Authorization: Bearer <token>`
    
-   **Success Response:**
    
    -   **Code:**  200  
    
        **Content:**

	    ```javascript
		  [
		  	{
				"_id": "600e1413526b730ac7d45fca",
				"title": "Spiderman",
				"released": "N/A",
				"genre": "Short",
				"director": "Christian Davi",
				"userId": 123,
				"createdAt": "2021-01-25T00:42:59.458Z",
				"updatedAt": "2021-01-25T00:42:59.458Z",
				"__v": 0
			}
		  ]
		```
-   **Error Response:**
    

    
    -   **Code:**  403 FORBIDDEN
    
        **Content:**  
        ```json
        {
			"statusCode": 403,
			"message": "invalid token | jwt must be provided | jwt expired | role is not supported", 
			"error": "Forbidden"
		}
		```

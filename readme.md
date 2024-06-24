# Nest-Rental Repository Documentation

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

The **[Nest-Rental](https://github.com/hpatel292-seneca/Nest-Rental)** repository by hpatel292-seneca is a web application designed for managing rental properties. Here's a detailed documentation to help understand the structure and components of this project:

## UI
![image](https://github.com/hpatel292-seneca/Nest-Rental/assets/100322816/ec4ed8c2-a448-4111-a777-26a21450b390)
- Home page of Nest Rental

## Database Diagram
![Database ER diagram (crow's foot)](https://github.com/hpatel292-seneca/Nest-Rental/assets/100322816/6a95ea23-0ecd-4431-97f5-5346ba30dd8e)
- MongoDB has been used for storing data


## Project Structure

### Root Directory
- `package.json`: Lists the project's dependencies and scripts ([GitHub](https://github.com/hpatel292-seneca/Nest-Rental/blob/main/package.json)).
- `package-lock.json`: Contains the exact versions of the project's dependencies ([GitHub](https://github.com/hpatel292-seneca/Nest-Rental/blob/main/package-lock.json)).
- `.gitignore`: Specifies files and directories to be ignored by Git ([GitHub](https://github.com/hpatel292-seneca/Nest-Rental/blob/main/.gitignore)).
- `readme.md`: Basic project information and instructions ([GitHub](https://github.com/hpatel292-seneca/Nest-Rental/blob/main/readme.md)).
- `vercel.json`: Configuration for deployment on Vercel ([GitHub](https://github.com/hpatel292-seneca/Nest-Rental/blob/main/vercel.json)).

### Key Dependencies
- **Express**: A minimal and flexible Node.js web application framework.
- **Mongoose**: An ODM (Object Data Modeling) library for MongoDB and Node.js.
- **bcryptjs**: For hashing passwords.
- **dotenv**: For loading environment variables from a .env file.
- **express-session**: For managing sessions.
- **connect-mongo**: MongoDB session store for Express.
- **express-fileupload**: For handling file uploads.
- **express-handlebars**: Handlebars view engine for Express.
- **@sendgrid/mail**: For sending emails using SendGrid ([GitHub](https://github.com/hpatel292-seneca/Nest-Rental#dependencies)).

### Folder Structure
- **api Directory**: Contains server-side code, routes, and handlers for the application's API endpoints.
- **public Directory**: Serves static files such as images, stylesheets, and JavaScript files.
- **views Directory**: Contains Handlebars templates used for rendering HTML pages.

## Setup and Installation
To set up the project locally, follow these steps:

1. Clone the repository:
   ```sh
   git clone https://github.com/hpatel292-seneca/Nest-Rental.git

2. Install dependencies
   ```sh
   Copy code
   npm install

3. Set up environment variables:
   Create a .env file in the root directory and add the necessary environment variables as specified in the dotenv configuration.

4. Run the application:
    ```sh
    Copy code
    npm start

This configuration tells Vercel to use the Node.js runtime for the files in the api directory.

## Key Features
- **User Authentication**: Secure user authentication and session management using bcryptjs and express-session.
- **Property Management**: Features for adding, updating, and deleting rental properties.
- **File Uploads**: Handling file uploads using express-fileupload.
- **Email Notifications**: Sending notifications via email using SendGrid.
  
This documentation provides a comprehensive overview of the Nest-Rental project, its structure, dependencies, and setup instructions. For more detailed information, you can visit the GitHub repository.

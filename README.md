# Project Nexus: Online Poll System Backend

This repository, `alx-backend-security`, hosts the backend implementation for an **Online Poll System**, developed as part of the **ProDev Backend Engineering** program's Project Nexus. This project aims to demonstrate proficiency in building robust, scalable, and secure backend systems, focusing on API development for real-time voting, efficient database design, and comprehensive API documentation.

## Table of Contents

-   [Project Overview](#project-overview)
-   [Project Goals](#project-goals)
-   [Key Features](#key-features)
-   [Technologies Used](#technologies-used)
-   [Getting Started (Local Development)](#getting-started-local-development)
    -   [Prerequisites](#prerequisites)
    -   [Setup Instructions](#setup-instructions)
    -   [Running the Application](#running-the-application)
-   [API Documentation (Swagger UI)](#api-documentation-swagger-ui)
-   [Deployment (PythonAnywhere)](#deployment-pythonanywhere)
-   [Challenges Faced & Solutions Implemented](#challenges-faced--solutions-implemented)
-   [Best Practices & Personal Takeaways](#best-practices--personal-takeaways)
-   [Contributing](#contributing)
-   [License](#license)
-   [Collaboration](#collaboration)

## Project Overview

This case study focuses on creating a backend for an interactive online poll system. The system provides APIs for users to create polls with multiple options, cast votes, and view real-time results. Emphasis has been placed on designing an efficient database schema capable of handling frequent voting operations and providing detailed, user-friendly API documentation. This project serves as a practical application of core backend engineering principles learned in the ProDev program.

## Project Goals

The primary objectives achieved by this backend are:

-   **API Development**: Build robust RESTful APIs for creating polls, managing poll options, casting votes, and fetching real-time poll results.
-   **Database Efficiency**: Design a PostgreSQL schema optimized for high-frequency write operations (voting) and efficient real-time result computation.
-   **User Authentication**: Implement secure JWT-based user authentication for managing access to poll creation and voting.
-   **Documentation**: Provide comprehensive and interactive API documentation using Swagger/OpenAPI.

## Key Features

1.  **Poll Management APIs**
    * Create, retrieve, update, and delete polls.
    * Each poll can have multiple choices/options.
    * Polls include metadata like creation date and optional expiry date.
2.  **Voting System APIs**
    * Users can cast votes for a specific choice within a poll.
    * Validations implemented to prevent duplicate voting by the same user on the same poll.
    * Requires authenticated users.
3.  **Real-Time Result Computation**
    * APIs to fetch the current vote counts for each option within a poll.
    * Efficient query design ensures quick result retrieval even with many votes.
4.  **User Authentication**
    * Secure user registration and login using JWT (JSON Web Tokens).
    * Endpoints for obtaining and refreshing access tokens.
5.  **Comprehensive API Documentation**
    * Integrated `drf-yasg` (Swagger/OpenAPI) to automatically generate interactive API documentation.
    * Documentation is hosted and easily accessible for frontend integration and testing.

## Technologies Used

* **Backend Framework**: [Django](https://www.djangoproject.com/)
* **API Framework**: [Django REST Framework (DRF)](https://www.django-rest-framework.org/)
* **Database**: [PostgreSQL](https://www.postgresql.org/)
* **Authentication**: [Django REST Framework Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/en/latest/)
* **API Documentation**: [DRF-YASG (Swagger/OpenAPI)](https://drf-yasg.readthedocs.io/en/stable/)
* **Virtual Environment**: `venv` (local), `virtualenv` (PythonAnywhere)
* **Version Control**: [Git](https://git-scm.com/) / [GitHub](https://github.com/)

## Getting Started (Local Development)

Follow these steps to set up and run the project on your local machine.

### Prerequisites

* Python 3.12+
* `pip` (Python package installer)
* `git`
* PostgreSQL installed and running locally.
* Redis server installed and running locally (if integrating Celery/caching for future enhancements).

### Setup Instructions

1.  **Clone the Repository**:
    ```bash
    git clone [https://github.com/tilahun0911455745/alx-backend-security.git](https://github.com/tilahun0911455745/alx-backend-security.git)
    cd alx-backend-security
    ```
    *(Note: Assuming this is the repository name for your overall Project Nexus.)*

2.  **Create and Activate Virtual Environment**:
    ```bash
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    ```

3.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    # If requirements.txt is not yet generated, install manually:
    # pip install Django djangorestframework djangorestframework-simplejwt drf-yasg psycopg2-binary
    ```

4.  **Configure Database**:
    * Ensure your local PostgreSQL server is running.
    * Create a new database for the project (e.g., `polldb`).
    * Update `alx_backend_security/settings.py` with your local PostgreSQL credentials:
        ```python
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': 'polldb', # Your local DB name
                'USER': 'your_db_user', # Your local DB user
                'PASSWORD': 'your_db_password', # Your local DB password
                'HOST': 'localhost',
                'PORT': '5432',
            }
        }
        ALLOWED_HOSTS = ['localhost', '127.0.0.1'] # For local testing
        ```

5.  **Run Migrations**:
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

6.  **Create a Superuser**:
    ```bash
    python manage.py createsuperuser
    ```

### Running the Application

1.  **Start Django Development Server**:
    ```bash
    python manage.py runserver
    ```
    The API will be accessible at `http://127.0.0.1:8000/api/`.

## API Documentation (Swagger UI)

Once the server is running, you can access the interactive API documentation at:
[http://127.0.0.1:8000/swagger/](http://127.0.0.1:8000/swagger/)

This documentation allows you to explore all available endpoints, view expected request/response formats, and directly test the APIs (including authentication using JWT).

## Deployment (PythonAnywhere)

The application is deployed on PythonAnywhere.

**Deployed API Documentation:** [https://tilahun0911455745.pythonanywhere.com/swagger/](https://tilahun0911455745.pythonanywhere.com/swagger/) *(Replace with your actual PythonAnywhere URL)*

**Key Deployment Steps:**
1.  **Virtual Environment**: Ensure `alx-backend-security-env` is created with Python 3.12.
2.  **Dependencies**: Install `requirements.txt` into the virtual environment.
3.  **PythonAnywhere Database Configuration**: Update `DATABASES` in `settings.py` for production:
    ```python
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'your_pythonanywhere_username$your_db_name', # e.g., tilahun0911455745$polldb
            'USER': 'your_pythonanywhere_username',
            'PASSWORD': 'your_db_password_from_pa',
            'HOST': 'your_pythonanywhere_username.postgresql.pythonanywhere-services.com',
            'PORT': '5432',
        }
    }
    ALLOWED_HOSTS = ['your_pythonanywhere_username.pythonanywhere.com']
    ```
4.  **Web App Configuration**: Set Source code, Working directory to `/home/your_pythonanywhere_username/alx-backend-security`.
5.  **WSGI File**: Update `wsgi.py` to point to the correct project path and settings module.
6.  **Static Files**: Configure `/static/` to `/home/your_pythonanywhere_username/alx-backend-security/staticfiles`.
7.  **Run Migrations & Collect Static**: Via a PythonAnywhere Bash console.
8.  **Reload Web App**: On the PythonAnywhere Web tab.

## Challenges Faced & Solutions Implemented

This section details significant hurdles encountered during the development and deployment of the poll system backend, and how they were overcome.

### 1. Environment Inconsistency (Local vs. PythonAnywhere)
* **Description**: Initial difficulties arose from discrepancies in Python versions and installed packages between my local development environment and the PythonAnywhere server, leading to `ModuleNotFoundError` and unexpected behavior.
* **Solution Implemented**: Standardized on Python 3.12 for both local development (using `venv`) and PythonAnywhere (creating `alx-backend-security-env` virtualenv). Meticulously updated `requirements.txt` and ensured all dependencies were installed on PythonAnywhere. Correctly configured PythonAnywhere web app to use the specific virtual environment.

### 2. Database Connection Issues
* **Description**: Encountered connection refused errors when trying to link Django to PostgreSQL both locally and on PythonAnywhere.
* **Solution Implemented**: Locally, ensured PostgreSQL server was actively running and correctly configured `DATABASES` settings with `localhost` and `5432`. For PythonAnywhere, meticulously updated `DATABASES` settings to use the correct hostname and database name format (`username$dbname`) provided by PythonAnywhere's PostgreSQL service.

### 3. Securing API Endpoints (Authentication & Authorization)
* **Description**: Implementing secure yet flexible access control for poll creation and voting required a robust authentication system.
* **Solution Implemented**: Integrated `djangorestframework-simplejwt` for JWT-based authentication. This provides secure token generation and validation. `permissions.IsAuthenticated` was applied to views requiring user login (e.g., creating polls, voting), while `permissions.IsAuthenticatedOrReadOnly` allowed public viewing of polls and results. Custom validation in `VoteSerializer` prevents duplicate votes.

### 4. Real-time Result Computation & Scalability
* **Description**: Ensuring that poll results are computed efficiently and accurately, especially as the number of votes grows, presented a potential performance bottleneck.
* **Solution Implemented**: Designed the `Vote` model with `unique_together` constraint to ensure data integrity. Utilized Django's ORM efficiently by leveraging `related_name` in `ForeignKey` relationships to easily count votes (`obj.votes.count()`) directly from `Choice` objects, minimizing complex queries. Future scalability could involve caching or pre-aggregating results with Celery.

### 5. API Documentation Clarity
* **Description**: Manually documenting API endpoints is time-consuming and prone to errors, hindering frontend integration.
* **Solution Implemented**: Integrated `drf-yasg` (Swagger/OpenAPI) into the project. This automatically generates and hosts interactive API documentation at `/swagger/`, providing a clear, up-to-date interface for exploring and testing endpoints directly from the browser, significantly improving developer experience.

## Best Practices & Personal Takeaways

* **Modular Design**: Structured the project into a dedicated `polls` app, adhering to Django's app structure for better organization and reusability.
* **Version Control Discipline**: Maintained a clean Git history with descriptive commit messages, facilitating easier tracking of features and fixes.
* **API-First Approach**: Designed API endpoints and serializers before diving into complex logic, ensuring a clear contract between frontend and backend.
* **Testing Mindset**: While not full TDD, constantly testing endpoints with Postman/cURL during development helped catch issues early.
* **Environment Variables (Future Enhancement)**: For production, externalizing sensitive credentials (like database passwords, secret keys) using environment variables would enhance security.
* **Error Handling**: Implemented custom validation in serializers and handled potential exceptions in views to provide meaningful error messages to API consumers.
* **Documentation is Key**: The experience reinforced that clear, accessible API documentation (like Swagger) is as crucial as the code itself for collaborative projects.

## Contributing

Feel free to fork this repository, submit pull requests, or open issues if you have suggestions or find bugs.

## License

This project is open-source and available under the [MIT License](LICENSE).

## Collaboration

This project is a product of the **ProDev Backend Engineering** program, emphasizing collaboration.

* **Fellow ProDev Backend Learners**: This repository serves as a resource for exchanging ideas, developing synergies, and organizing study/coding sessions.
* **ProDev Frontend Learners**: Crucially, this backend provides the API endpoints for frontend applications. Collaboration with frontend learners via the dedicated Discord channel (`#ProDevProjectNexus`) is essential to ensure seamless integration and collective success in building full-stack projects.

---

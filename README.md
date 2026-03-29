🏢 Business Management System (NestJS API)

A robust REST API built with NestJS, designed for comprehensive company operations management. This system handles employee records, work hours tracking, leave management, and an ordering system for company-manufactured products.

🚀 Key Features

👥 User Management & RBAC
The application implements a strict Role-Based Access Control (RBAC) system:

    User (Employee): View personal work logs, request annual leave, and track days off.
    Admin (Department Head): Manage employees within their sector, approve/reject leave requests, and monitor team performance.
    Super Admin (Owner/Director): Full system access, management of departments, administrator assignments, and overall business reporting.



⏳ Time Tracking & Absences

    Attendance Tracking: Digital check-in/check-out system for work hours.
    Leave Management: Automated workflow for requesting and approving vacations and sick leaves.

    📦 Production & Ordering

    Order Management: Digital catalog of company products with a system for placing and tracking orders.
    Product Catalog: CRUD operations for items produced by the company.

🛠 Tech Stack

    Framework: NestJS (Node.js)
    Database: PostgreSQL
    ORM: TypeORM
    Authentication: Passport.js & JWT (JSON Web Tokens)
    Documentation: Postman

📋 Prerequisites

Before running the project, ensure you have:

    Node.js (v16.x or later)
    npm 

🔧 Installation & Setup

    1.Clone the repository:

      git clone https://github.com/SlobodanSkaric/inco81app.git
      cd project-name

    2.Install dependencies:

      npm install

   3.Configure Environment Variables:
      Create a .env file in the root directory:
        DATABASE_URL=postgres://user:pass@localhost:5432/db_name
        JWT_SECRET=your_super_secret_key
        PORT=3000

    4.Run the application:
        npm run start:dev



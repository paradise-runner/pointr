# pointr.

pointr. is the next generation story pointing tool, designed to streamline and enhance the estimation process for agile teams. This README provides an overview of the app, its features, and instructions for setup and usage.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Real-time collaboration**: Enables distributed teams to work together seamlessly
- **Intuitive user interface**: Provides a smooth story pointing experience
- **Secure and private sessions**: Ensures data privacy and security
- **Customizable point scales**: Adapts to your team's preferred estimation method
- **Instant result visualization**: Offers immediate insights into team estimations
- **Dark mode support**: Enhances user experience with theme options

## Technologies Used

pointr. is built with cutting-edge technologies to ensure optimal performance and user experience:

- **Next.js**: React framework for server-side rendering and optimal performance
- **React**: Efficient UI library for building interactive user interfaces
- **TypeScript**: Strongly-typed JavaScript for improved developer experience and code quality
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Supabase**: Open-source Firebase alternative for real-time database and authentication
- **shadcn/ui**: Beautifully designed components built with Radix UI and Tailwind CSS

## Getting Started

To run pointr. locally, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/your-username/pointr.git
   ```

2. Navigate to the project directory:
   ```
   cd pointr
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

5. Run the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Usage

1. **Create a New Session**:
   - Click on "Start New Session" on the home page
   - Share the generated session ID with your team members

2. **Join an Existing Session**:
   - Enter the session ID in the "Join an Existing Session" input field
   - Click "Join Session"

3. **Add Stories**:
   - Once in a session, use the "Add New Story" feature to create stories for estimation

4. **Vote on Stories**:
   - Select a story to start voting
   - Choose your point estimate from the available options
   - Submit your vote

5. **View Results**:
   - After all team members have voted, view the collective estimations
   - Discuss any discrepancies and reach a consensus

6. **End Voting**:
   - Conclude the voting process for a story when consensus is reached
   - Move on to the next story or end the session

## Contributing

We welcome contributions to pointr.! Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes and commit them with clear, descriptive messages
4. Push your changes to your fork
5. Submit a pull request to the main repository

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
```
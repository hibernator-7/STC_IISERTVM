/*
Welcome to the content hub for your website!

To update the content on your website, you only need to edit this file.
This approach keeps all your data in one place, making it easy to manage without having to edit any HTML files directly.

Instructions:
- To change text, simply replace the text inside the quotes (e.g., "Your Name").
- To change an image, replace the image URL (e.g., "https://picsum.photos/seed/your-seed/200/200").
- To add a new item (like a team member or an event), copy one of the existing blocks (everything from the opening `{` to the closing `}`), paste it at the end of the list, and update the content. Make sure to add a comma after the closing `}` of the item before it.

*/

// --- LEADERSHIP DATA ---
const leadershipData = {
    fic: {
        name: "Dr. John Doe",
        title: "Faculty-in-Charge, STC",
        message: "The Science and Technology Council is a cornerstone of student-led innovation at IISER TVM. It's a pleasure to see our students take such initiative in fostering a vibrant scientific community.",
        imageUrl: "https://picsum.photos/seed/fic/250/250"
    },
    dosa: {
        name: "Dr. Jane Smith",
        title: "Dean of Student Affairs",
        message: "The activities organized by the STC are integral to the holistic development of our students. We are proud to support their endeavors and look forward to their future achievements.",
        imageUrl: "https://picsum.photos/seed/dosa/250/250"
    }
};

const councilMembers = [
    { name: "Alex Johnson", position: "General Secretary", imageUrl: "https://picsum.photos/seed/sec1/200/200" },
    { name: "Maria Garcia", position: "Joint Secretary", imageUrl: "https://picsum.photos/seed/sec2/200/200" },
    { name: "Chen Wei", position: "Treasurer", imageUrl: "https://picsum.photos/seed/sec3/200/200" },
    { name: "Fatima Ahmed", position: "Events Head", imageUrl: "https://picsum.photos/seed/sec4/200/200" }
];

const pastSecretaries = [
    { year: "2023", name: "Priya Sharma" },
    { year: "2022", name: "Rahul Verma" },
    { year: "2021", name: "Anjali Menon" },
    { year: "2020", name: "David Lee" }
];


// --- EVENTS DATA ---
const upcomingEvents = [
    {
        date: "15 JAN",
        title: "Workshop on Quantum Computing",
        description: "Hosted by Parsec Club. A deep dive into the future of computing."
    },
    {
        date: "02 FEB",
        title: "Web Dev Bootcamp Kick-off",
        description: "Hosted by CCIT Club. The start of our 4-week intensive bootcamp."
    }
];

const pastEvents = [
    {
        date: "20 DEC",
        title: "Introduction to Astrophotography",
        description: "Hosted by Parsec Club. A session on capturing the cosmos."
    },
    {
        date: "05 NOV",
        title: "Bio-inspired Robotics Seminar",
        description: "Hosted by Proteus Club. Exploring robotics inspired by nature."
    }
];


// --- UPDATES DATA ---
const latestUpdates = [
    {
        date: "Jan 10, 2024",
        title: "New STC Council Elected",
        excerpt: "The results for the student council elections are out. We are excited to welcome the new team who will be leading the STC for the next academic year. Read on to meet the new secretaries and learn about their vision for the council.",
        link: "#"
    },
    {
        date: "Dec 28, 2023",
        title: "Anvesha '24 Post-Event Report",
        excerpt: "Anvesha '24 was a massive success, with over 1000 participants from across the country...",
        link: "#"
    },
    {
        date: "Nov 15, 2023",
        title: "Club Registrations for Spring Semester are Open",
        excerpt: "Want to be a part of the STC family? Registrations for all our affiliated clubs are now open...",
        link: "#"
    }
];


// --- CLUB SPECIFIC DATA ---
// You can add team members for each club here.
const clubTeams = {
    ccit: [
        { name: "Jane Doe", position: "President", imageUrl: "https://picsum.photos/seed/member1/200/200" },
        { name: "John Smith", position: "Vice President", imageUrl: "https://picsum.photos/seed/member2/200/200" },
        { name: "Emily Jones", position: "Events Coordinator", imageUrl: "https://picsum.photos/seed/member3/200/200" }
    ],
    psit: [
        // Add PSIT team members here
    ],
    // ... add other clubs
};

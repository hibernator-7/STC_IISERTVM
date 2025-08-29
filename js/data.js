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
    director: {
        name: "Professor Jarugu Narasimha Moorthy",
        title: "Director, IISER TVM",
        message: "A message from the director can be placed here.", // Placeholder message
        imageUrl: "https://drive.google.com/file/d/1qCmhnGR43BbWcx2CDk5tF5zxRiMA93Pu/view?usp=drive_link"
    },
    dosa: {
        name: "Prof Rajeev N Kini",
        title: "Dean of Student Affairs",
        message: "A message from the Dean of Student Affairs can be placed here.", // Placeholder message
        imageUrl: "images/members/faculty_advisors/prof_rajeev_n_kini.jpg"
    },
    currentAdvisors: [
        {
            name: "Dr. Sanu Shameer",
            title: "Faculty Advisor, STC",
            message: "A message from the faculty advisor can be placed here.",
            imageUrl: "https://picsum.photos/seed/fic1/250/250"
        },
        {
            name: "Dr. Krishnendu Gope",
            title: "Faculty Advisor, STC",
            message: "A message from the faculty advisor can be placed here.",
            imageUrl: "https://picsum.photos/seed/fic2/250/250"
        }
    ],
    formerAdvisors: [
        { name: "Prof Utpal Manna" },
        { name: "Dr. Jishy Varghese" },
        { name: "Dr. Nisha N Kannan" }
    ]
};

const councilMembers = [
    { name: "Ishaani R Kamath", position: "Secretary (BS-MS 21)", imageUrl: "https://picsum.photos/seed/sec1/200/200" },
    { name: "Pearl", position: "Member", imageUrl: "https://picsum.photos/seed/mem1/200/200" },
    { name: "Arvind Lomrore", position: "Member", imageUrl: "https://picsum.photos/seed/mem2/200/200" },
    { name: "Alan Varghese Jophy", position: "Member", imageUrl: "https://picsum.photos/seed/mem3/200/200" },
    { name: "Adheena Lakshmi", position: "Member", imageUrl: "https://picsum.photos/seed/mem4/200/200" },
    { name: "Abhiram Mahesh", position: "Member", imageUrl: "https://picsum.photos/seed/mem5/200/200" },
    { name: "Aashlesha Chavan", position: "Member", imageUrl: "https://picsum.photos/seed/mem6/200/200" },
    { name: "A J Nithin", position: "Member", imageUrl: "https://picsum.photos/seed/mem7/200/200" }
];

const pastSecretaries = [
    { year: "BS-MS 20", name: "Devashish Kalmegh" },
    { year: "BS-MS 19", name: "Ravikiran Hegde" },
    { year: "BS-MS 18", name: "Sharang Rajesh Iyer" }
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
        link: "#",
        imageUrl: "https://picsum.photos/seed/update1/400/250"
    },
    {
        date: "Dec 28, 2023",
        title: "Anvesha '24 Post-Event Report",
        excerpt: "Anvesha '24 was a massive success, with over 1000 participants from across the country...",
        link: "#",
        imageUrl: "https://picsum.photos/seed/update2/400/250"
    },
    {
        date: "Nov 15, 2023",
        title: "Club Registrations for Spring Semester are Open",
        excerpt: "Want to be a part of the STC family? Registrations for all our affiliated clubs are now open...",
        link: "#",
        imageUrl: "https://picsum.photos/seed/update3/400/250"
    }
];


// --- CLUB SPECIFIC DATA ---
// You can add team members for each club here.
const clubTeams = {
    ccit: [
        { name: "Saurab Mishra", position: "President", imageUrl: "https://picsum.photos/seed/member1/200/200" },
        { name: "Satyam", position: "Vice President", imageUrl: "https://picsum.photos/seed/member2/200/200" },
        { name: "ABC", position: "Events Coordinator", imageUrl: "https://picsum.photos/seed/member3/200/200" }
    ],
    psit: [
        // Add PSIT team members here
    ],
    // ... add other clubs
};

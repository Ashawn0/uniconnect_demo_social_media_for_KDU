export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'student' | 'faculty';
  avatar?: string;
  bio?: string;
  year?: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  likedBy: string[];
  timestamp: Date;
  groupId?: string;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  members: string[];
  image?: string;
  isPrivate: boolean;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  fileType: string;
  fileSize: string;
  uploadedBy: string;
  timestamp: Date;
  tags: string[];
  downloadCount: number;
  thumbnailUrl?: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'group' | 'resource';
  userId: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@university.edu',
    department: 'Computer Science',
    role: 'student',
    bio: '4th year CS student interested in AI and machine learning',
    year: 'Senior'
  },
  {
    id: '2',
    name: 'Dr. Michael Torres',
    email: 'mtorres@university.edu',
    department: 'Computer Science',
    role: 'faculty',
    bio: 'Associate Professor of Computer Science'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.r@university.edu',
    department: 'Psychology',
    role: 'student',
    bio: 'Psychology major, mental health advocate',
    year: 'Junior'
  },
  {
    id: '4',
    name: 'James Park',
    email: 'jpark@university.edu',
    department: 'Engineering',
    role: 'student',
    bio: 'Mechanical Engineering student and robotics club president',
    year: 'Sophomore'
  },
  {
    id: '5',
    name: 'Dr. Lisa Wang',
    email: 'lwang@university.edu',
    department: 'Business',
    role: 'faculty',
    bio: 'Professor of Business Analytics'
  }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    userId: '1',
    content: 'Just finished our final project for Advanced Algorithms! The team did amazing work. Who else is done with finals? 🎉',
    likes: 24,
    comments: [
      {
        id: 'c1',
        userId: '3',
        content: 'Congrats! Still have two more to go 😅',
        timestamp: new Date('2025-12-04T14:30:00')
      },
      {
        id: 'c2',
        userId: '4',
        content: 'Great job! Your presentation was really impressive',
        timestamp: new Date('2025-12-04T15:00:00')
      }
    ],
    likedBy: ['2', '3', '4'],
    timestamp: new Date('2025-12-04T12:00:00')
  },
  {
    id: '2',
    userId: '2',
    content: 'Reminder: Office hours tomorrow 2-4pm in room 301. Come prepared with questions about the upcoming exam. Study guide posted on the resource hub.',
    likes: 42,
    comments: [],
    likedBy: ['1', '3'],
    timestamp: new Date('2025-12-04T09:00:00')
  },
  {
    id: '3',
    userId: '4',
    content: 'Robotics Club is hosting a demo day next Friday! Come check out what we\'ve been building this semester. Free pizza 🍕🤖',
    likes: 56,
    comments: [
      {
        id: 'c3',
        userId: '1',
        content: 'Definitely coming! What time?',
        timestamp: new Date('2025-12-03T16:00:00')
      }
    ],
    likedBy: ['1', '3', '5'],
    timestamp: new Date('2025-12-03T15:00:00')
  },
  {
    id: '4',
    userId: '3',
    content: 'Looking for study partners for Psych 301. Anyone interested in forming a study group for next semester?',
    likes: 15,
    comments: [
      {
        id: 'c4',
        userId: '1',
        content: 'I might take that class next semester!',
        timestamp: new Date('2025-12-02T11:00:00')
      }
    ],
    likedBy: ['1', '4'],
    timestamp: new Date('2025-12-02T10:00:00')
  }
];

export const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Computer Science Dept',
    description: 'Official group for CS department students and faculty',
    category: 'Department',
    members: ['1', '2', '4'],
    isPrivate: false
  },
  {
    id: '2',
    name: 'AI Research Lab',
    description: 'Machine learning and AI research discussions',
    category: 'Research',
    members: ['1', '2'],
    isPrivate: false
  },
  {
    id: '3',
    name: 'Robotics Club',
    description: 'Building robots and competing in competitions',
    category: 'Club',
    members: ['1', '4'],
    isPrivate: false
  },
  {
    id: '4',
    name: 'Class of 2026',
    description: 'Connect with your graduating class',
    category: 'Cohort',
    members: ['3', '4'],
    isPrivate: false
  },
  {
    id: '5',
    name: 'Psychology Students',
    description: 'Discussion group for psychology majors',
    category: 'Department',
    members: ['3'],
    isPrivate: false
  },
  {
    id: '6',
    name: 'Entrepreneurship Club',
    description: 'For students interested in startups and business',
    category: 'Club',
    members: ['1', '5'],
    isPrivate: false
  }
];

export const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Data Structures Cheat Sheet',
    description: 'Comprehensive guide to common data structures with Big-O notation',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    uploadedBy: '1',
    timestamp: new Date('2025-12-01T10:00:00'),
    tags: ['computer-science', 'algorithms', 'study-guide'],
    downloadCount: 128
  },
  {
    id: '2',
    title: 'Psychology Research Methods Notes',
    description: 'Lecture notes from Psych 301 - Research Methods',
    fileType: 'PDF',
    fileSize: '1.8 MB',
    uploadedBy: '3',
    timestamp: new Date('2025-11-28T14:00:00'),
    tags: ['psychology', 'research', 'notes'],
    downloadCount: 67
  },
  {
    id: '3',
    title: 'Calculus Formula Reference',
    description: 'All essential calculus formulas in one place',
    fileType: 'PDF',
    fileSize: '856 KB',
    uploadedBy: '4',
    timestamp: new Date('2025-11-25T09:00:00'),
    tags: ['mathematics', 'calculus', 'reference'],
    downloadCount: 203
  },
  {
    id: '4',
    title: 'Machine Learning Project Template',
    description: 'Starter code and documentation for ML projects',
    fileType: 'ZIP',
    fileSize: '4.2 MB',
    uploadedBy: '2',
    timestamp: new Date('2025-11-20T11:00:00'),
    tags: ['machine-learning', 'code', 'template'],
    downloadCount: 89
  },
  {
    id: '5',
    title: 'Business Plan Template',
    description: 'Template for creating comprehensive business plans',
    fileType: 'DOCX',
    fileSize: '524 KB',
    uploadedBy: '5',
    timestamp: new Date('2025-11-15T13:00:00'),
    tags: ['business', 'entrepreneurship', 'template'],
    downloadCount: 145
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    userId: '3',
    message: 'Emily Rodriguez liked your post',
    timestamp: new Date('2025-12-04T14:30:00'),
    read: false
  },
  {
    id: '2',
    type: 'comment',
    userId: '4',
    message: 'James Park commented on your post',
    timestamp: new Date('2025-12-04T15:00:00'),
    read: false
  },
  {
    id: '3',
    type: 'group',
    userId: '2',
    message: 'Dr. Michael Torres posted in Computer Science Dept',
    timestamp: new Date('2025-12-04T09:00:00'),
    read: true
  },
  {
    id: '4',
    type: 'resource',
    userId: '1',
    message: 'New resource uploaded: Data Structures Cheat Sheet',
    timestamp: new Date('2025-12-01T10:00:00'),
    read: true
  }
];

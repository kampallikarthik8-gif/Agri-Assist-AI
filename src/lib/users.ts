
export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "Farmer" | "Admin" | "Agronomist";
  status: "Active" | "Inactive" | "Invited";
  lastLogin: string;
};

export const users: User[] = [
  {
    id: "usr_001",
    name: "Admin",
    email: "admin@example.com",
    avatar: "https://picsum.photos/seed/admin-user/100",
    role: "Admin",
    status: "Active",
    lastLogin: "2024-05-20T10:00:00Z",
  },
  {
    id: "usr_002",
    name: "Sanjay Patel",
    email: "sanjay.p@example.com",
    avatar: "https://picsum.photos/seed/sanjay-patel/100",
    role: "Farmer",
    status: "Active",
    lastLogin: "2024-05-21T14:30:00Z",
  },
  {
    id: "usr_003",
    name: "Dr. Anjali Sharma",
    email: "anjali.s@example.com",
    avatar: "https://picsum.photos/seed/anjali-sharma/100",
    role: "Agronomist",
    status: "Active",
    lastLogin: "2024-05-21T09:15:00Z",
  },
  {
    id: "usr_004",
    name: "Rajesh Kumar",
    email: "rajesh.k@example.com",
    avatar: "https://picsum.photos/seed/rajesh-kumar/100",
    role: "Farmer",
    status: "Inactive",
    lastLogin: "2024-04-15T18:00:00Z",
  },
  {
    id: "usr_005",
    name: "Priya Singh",
    email: "priya.s@example.com",
    avatar: "https://picsum.photos/seed/priya-singh/100",
    role: "Farmer",
    status: "Invited",
    lastLogin: "2024-05-18T11:45:00Z",
  },
   {
    id: "usr_006",
    name: "Amit Kumar",
    email: "amit.k@example.com",
    avatar: "https://picsum.photos/seed/amit-kumar/100",
    role: "Farmer",
    status: "Active",
    lastLogin: "2024-05-22T08:00:00Z",
  },
  {
    id: "usr_007",
    name: "Sunita Devi",
    email: "sunita.d@example.com",
    avatar: "https://picsum.photos/seed/sunita-devi/100",
    role: "Farmer",
    status: "Active",
    lastLogin: "2024-05-22T10:20:00Z",
  },
  {
    id: "usr_008",
    name: "Vikram Singh",
    email: "vikram.s@example.com",
    avatar: "https://picsum.photos/seed/vikram-singh/100",
    role: "Farmer",
    status: "Inactive",
    lastLogin: "2024-03-30T12:00:00Z",
  },
];

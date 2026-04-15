import fs from "fs";
import path from "path";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";
const OUTPUT_PATH = path.resolve(process.cwd(), "load-tests/seed-data.json");
const FIXTURE_PATH = path.resolve(process.cwd(), "load-tests/fixtures/test-file.pdf");

type SeedUser = {
  email: string;
  password: string;
  id: string;
  cookie: string;
};

type JsonValue = Record<string, any>;

async function requestJson(
  method: string,
  endpoint: string,
  body?: JsonValue,
  cookie?: string
) {
  const headers: Record<string, string> = {};
  if (body) headers["Content-Type"] = "application/json";
  if (cookie) headers["Cookie"] = cookie;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(`${method} ${endpoint} failed (${response.status}): ${text}`);
  }

  const setCookie = response.headers.get("set-cookie") || "";
  const sessionCookie = setCookie.split(";")[0];
  return { data, sessionCookie };
}

async function uploadFile(cookie: string, filename: string) {
  const form = new FormData();
  const fileBuffer = fs.readFileSync(FIXTURE_PATH);
  const blob = new Blob([fileBuffer], { type: "application/pdf" });
  form.append("file", blob, filename);

  const response = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    headers: { Cookie: cookie },
    body: form,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(`POST /api/upload failed (${response.status}): ${text}`);
  }
  return data.url as string;
}

async function registerOrLogin(email: string, password: string, firstName: string, lastName: string): Promise<SeedUser> {
  let user: any;
  let cookie = "";

  try {
    const register = await requestJson("POST", "/api/auth/register", {
      email,
      password,
      firstName,
      lastName,
      role: "student",
    });
    user = register.data;
    cookie = register.sessionCookie;
  } catch (error: any) {
    if (!String(error.message).includes("409")) {
      throw error;
    }
    const login = await requestJson("POST", "/api/auth/login", { email, password });
    user = login.data;
    cookie = login.sessionCookie;
  }

  return { email, password, id: user.id, cookie };
}

async function main() {
  if (!fs.existsSync(FIXTURE_PATH)) {
    fs.writeFileSync(FIXTURE_PATH, Buffer.alloc(512000, "A"));
  }

  const users: SeedUser[] = [];
  const postIds: string[] = [];
  const groupIds: string[] = [];
  const resourceIds: string[] = [];

  for (let i = 1; i <= 20; i++) {
    const email = `testuser${i}@kdu.ac.kr`;
    const user = await registerOrLogin(email, "TestPass123!", `Test${i}`, `User${i}`);
    users.push(user);
  }

  const user1 = users[0];
  const user2 = users[1];
  const user3 = users[2];

  for (let i = 0; i < 30; i++) {
    const { data: post } = await requestJson(
      "POST",
      "/api/posts",
      { content: `Seed post ${i + 1} at ${new Date().toISOString()}` },
      user1.cookie
    );
    postIds.push(post.id);
  }

  for (let i = 0; i < 5; i++) {
    const { data: group } = await requestJson(
      "POST",
      "/api/groups",
      {
        name: `Seed Group ${i + 1}`,
        description: `Seeded group ${i + 1}`,
        type: "club",
        isPrivate: false,
      },
      user2.cookie
    );
    groupIds.push(group.id);
  }

  for (const groupId of groupIds) {
    await requestJson("POST", `/api/groups/${groupId}/join`, {}, user1.cookie);
  }

  for (let i = 0; i < 5; i++) {
    const fileUrl = await uploadFile(user3.cookie, `seed-resource-${i + 1}.pdf`);
    const { data: resource } = await requestJson(
      "POST",
      "/api/resources",
      {
        title: `Seed Resource ${i + 1}`,
        description: `Seeded resource ${i + 1}`,
        fileUrl,
        fileType: "pdf",
        fileSize: "500KB",
        tags: ["seed", "load-test"],
      },
      user3.cookie
    );
    resourceIds.push(resource.id);
  }

  const output = {
    baseUrl: BASE_URL,
    generatedAt: new Date().toISOString(),
    users,
    postIds,
    groupIds,
    resourceIds,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`Seed data written to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

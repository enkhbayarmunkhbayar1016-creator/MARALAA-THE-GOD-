const BASE_URL = "https://todu.mn/bs/lms/v1";

export const api = {
  async fetchCourses() {
    const response = await fetch(`${BASE_URL}/courses`);
    if (!response.ok) throw new Error("Failed to fetch courses");
    return response.json();
  },

  async fetchCourse(id: string) {
    const response = await fetch(`${BASE_URL}/courses/${id}`);
    if (!response.ok) throw new Error("Failed to fetch course");
    return response.json();
  },

  async createCourse(course: any) {
    const response = await fetch(`${BASE_URL}/courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(course),
    });
    if (!response.ok) throw new Error("Failed to create course");
    return response.json();
  },

  async updateCourse(id: string, course: any) {
    const response = await fetch(`${BASE_URL}/courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(course),
    });
    if (!response.ok) throw new Error("Failed to update course");
    return response.json();
  },

  async deleteCourse(id: string) {
    const response = await fetch(`${BASE_URL}/courses/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete course");
    return response.json();
  },
};

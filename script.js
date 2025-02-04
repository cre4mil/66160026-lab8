class Blog {
  constructor(
    id,
    title,
    content,
    tags,
    createdDate = new Date(),
    updatedDate = new Date()
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.tags = tags.split(",").map((tag) => tag.trim());
    this.createdDate = new Date(createdDate); // ใช้วันที่จาก LocalStorage ถ้ามี
    this.updatedDate = new Date(updatedDate);
  }

  //   อัปเดตข้อมูลบล็อกและอัปเดตวันที่แก้ไขล่าสุด
  update(title, content, tags) {
    this.title = title;
    this.content = content;
    this.tags = tags.split(",").map((tag) => tag.trim());
    this.updatedDate = new Date();
  }
  //   จัดรูปแบบวันที่
  getFormattedDate(date) {
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  //   เพิ่มวันที่สร้างบล็อก
  getCreatedDate() {
    return this.getFormattedDate(this.createdDate);
  }
  // เพิ่มวันที่มีการแก้ไขบล็อก
  getUpdatedDate() {
    return this.getFormattedDate(this.updatedDate);
  }
}

// จัดการบล็อก เพิ่ม, แก้ไข, ลบ, และค้นหาบล็อก
class BlogManager {
  constructor() {
    this.blogs =
      JSON.parse(localStorage.getItem("blogs"))?.map(
        (blog) =>
          new Blog(
            blog.id,
            blog.title,
            blog.content,
            blog.tags.join(", "),
            blog.createdDate,
            blog.updatedDate
          )
      ) || [];
  }
  // บันทึกข้อมูลบล็อกทั้งหมดลงใน LocalStorage
  saveToLocalStorage() {
    localStorage.setItem("blogs", JSON.stringify(this.blogs));
  }

  //   เพิ่มบล็อกใหม่
  addBlog(title, content, tags) {
    const blog = new Blog(Date.now(), title, content, tags);
    this.blogs.push(blog);
    this.saveToLocalStorage();
    return blog;
  }
  //   อัปเดตบล็อกที่มี
  updateBlog(id, title, content, tags) {
    const blog = this.getBlog(id);
    if (blog) {
      blog.update(title, content, tags);
      this.saveToLocalStorage();
    }
  }

  deleteBlog(id) {
    this.blogs = this.blogs.filter((blog) => blog.id !== id);
    this.saveToLocalStorage();
  }

  // แสดงบล็อกทั้งหมด
  getBlog(id) {
    return this.blogs.find((blog) => blog.id === id);
  }

  sortBlogs() {
    this.blogs.sort((a, b) => b.updatedDate - a.updatedDate);
  }

  // ค้นหาบล็อกตาม tag
  getBlogsByTag(tag) {
    if (!tag) return this.blogs;
    return this.blogs.filter((blog) => blog.tags.includes(tag));
  }
}

// จัดการ UI
class BlogUI {
  constructor(blogManager) {
    this.blogManager = blogManager;
    this.initElements();
    this.initEventListeners();
    this.render();
  }

  // เรียงลำดับบล็อกตามวันที่สร้าง
  initElements() {
    this.form = document.getElementById("blog-form");
    this.titleInput = document.getElementById("title");
    this.contentInput = document.getElementById("content");
    this.tagsInput = document.getElementById("tags");
    this.editIdInput = document.getElementById("edit-id");
    this.blogList = document.getElementById("blog-list");
    this.searchInput = document.getElementById("search-tag");
    this.searchBtn = document.getElementById("search-btn");
    this.cancelBtn = document.getElementById("cancel-btn");
  }

  //ตั้งค่า event listeners ให้ UI
  initEventListeners() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    this.searchBtn.addEventListener("click", () => {
      this.render(this.searchInput.value.trim());
    });

    this.cancelBtn.addEventListener("click", () => {
      this.resetForm();
    });
  }

  // บันทึกข้อมูลใหม่ หรือแก้ไขข้อมูลบล็อก
  handleSubmit() {
    const title = this.titleInput.value.trim();
    const content = this.contentInput.value.trim();
    const tags = this.tagsInput.value.trim();
    const editId = parseInt(this.editIdInput.value);

    if (title && content) {
      if (editId) {
        this.blogManager.updateBlog(editId, title, content, tags);
      } else {
        this.blogManager.addBlog(title, content, tags);
      }
      this.resetForm();
      this.render();
    }
  }

  //โหลดข้อมูลบล็อกมาแก้ไข
  editBlog(id) {
    const blog = this.blogManager.getBlog(id);
    if (blog) {
      this.titleInput.value = blog.title;
      this.contentInput.value = blog.content;
      this.tagsInput.value = blog.tags.join(", ");
      this.editIdInput.value = blog.id;
      document.getElementById("form-title").textContent = "แก้ไขบล็อก";
      this.cancelBtn.classList.remove("hidden");
      window.scrollTo(0, 0);
    }
  }

  //ลบบล็อก
  deleteBlog(id) {
    if (confirm("ต้องการลบบล็อกนี้ใช่หรือไม่?")) {
      this.blogManager.deleteBlog(id);
      this.render();
    }
  }

  //ล้างฟอร์ม
  resetForm() {
    this.form.reset();
    this.editIdInput.value = "";
    document.getElementById("form-title").textContent = "เขียนบล็อกใหม่";
    this.cancelBtn.classList.add("hidden");
  }

  //แสดงบล็อกทั้งหมดในหน้าเว็บ
  render(tag = "") {
    this.blogList.innerHTML = this.blogManager
      .getBlogsByTag(tag)
      .map(
        (blog) => `
                <div class="blog-post">
                    <h2>${blog.title}</h2>
                    <div class="blog-date">
                        <small>เขียนเมื่อ: ${blog.getCreatedDate()}</small><br>
                        <small>อัปเดตล่าสุด: ${blog.getUpdatedDate()}</small>
                    </div>
                    <div class="blog-tags">#${blog.tags.join(" #")}</div>
                    <p>${blog.content}</p>
                    <div class="blog-actions">
                        <button class="btn-edit" onclick="blogUI.editBlog(${
                          blog.id
                        })">แก้ไข</button>
                        <button class="btn-delete" onclick="blogUI.deleteBlog(${
                          blog.id
                        })">ลบ</button>
                    </div>
                </div>
            `
      )
      .join("");
  }
}

// เริ่มทำงาน
const blogManager = new BlogManager();
const blogUI = new BlogUI(blogManager);

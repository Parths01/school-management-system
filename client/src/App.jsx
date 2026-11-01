import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "/api";
const initialSchoolForm = { schoolName: "", administratorName: "", administratorTitle: "", academicYear: "" };
const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  grade: "",
  section: "",
};

const navigation = [
  { label: "Dashboard", icon: "dashboard" },
  { label: "Students", icon: "students" },
];

function Icon({ name, size = 20 }) {
  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="5" rx="2" />
        <rect x="13" y="10" width="8" height="11" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
      </>
    ),
    students: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    plus: <path d="M12 5v14m-7-7h14" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    down: <path d="m7 10 5 5 5-5" />,
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    close: <path d="m18 6-12 12M6 6l12 12" />,
    graduation: (
      <>
        <path d="m22 10-10-5L2 10l10 5 10-5Z" />
        <path d="M6 12v5c3.5 2.7 8.5 2.7 12 0v-5M22 10v6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1" />
      </>
    ),
    alert: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4m0 4h.01" />
      </>
    ),
    arrow: <path d="M7 17 17 7M7 7h10v10" />,
    trash: (
      <>
        <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function initials(student) {
  return `${student.firstName?.[0] ?? ""}${student.lastName?.[0] ?? ""}`.toUpperCase();
}

function formatDate(date) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [school, setSchool] = useState(null);
  const [schoolLoaded, setSchoolLoaded] = useState(false);
  const [schoolForm, setSchoolForm] = useState(initialSchoolForm);
  const [schoolModalOpen, setSchoolModalOpen] = useState(false);
  const [schoolSaving, setSchoolSaving] = useState(false);
  const [page, setPage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All students");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [sort, setSort] = useState({ by: "createdAt", order: "desc" });
  const [success, setSuccess] = useState("");
  const [viewingStudent, setViewingStudent] = useState(null);

  async function loadStudents() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(pagination.page), limit: "10", sortBy: sort.by, sortOrder: sort.order });
      if (search.trim()) params.set("q", search.trim());
      if (statusFilter !== "All students") params.set("status", statusFilter);
      const response = await fetch(`${API_URL}/students?${params}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to load students.");
      setStudents(result.data);
      setPagination(result.pagination);
    } catch (loadError) {
      setError(loadError.message || "Unable to connect to the school server.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboard() {
    try {
      const response = await fetch(`${API_URL}/dashboard`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to load dashboard data.");
      setDashboard(result.data);
    } catch (loadError) {
      setError(loadError.message || "Unable to load dashboard data.");
    }
  }

  async function loadSchool() {
    try {
      const response = await fetch(`${API_URL}/school`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to load school profile.");
      setSchool(result.data);
    } catch (loadError) {
      setError(loadError.message || "Unable to load school profile.");
    } finally {
      setSchoolLoaded(true);
    }
  }

  useEffect(() => { loadStudents(); }, [pagination.page, search, statusFilter, sort.by, sort.order]);
  useEffect(() => { loadDashboard(); loadSchool(); }, []);

  const filteredStudents = students;
  const activeCount = dashboard?.activeStudents ?? 0;
  const classCount = dashboard?.classCount ?? 0;

  function openSchoolSettings() {
    setSchoolForm(school ? {
      schoolName: school.schoolName,
      administratorName: school.administratorName,
      administratorTitle: school.administratorTitle,
      academicYear: school.academicYear ?? "",
    } : initialSchoolForm);
    setError("");
    setSchoolModalOpen(true);
  }

  async function saveSchool(event) {
    event.preventDefault();
    setSchoolSaving(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/school`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schoolForm),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to save school profile.");
      setSchool(result.data);
      setSchoolModalOpen(false);
      setSuccess("School profile saved.");
    } catch (saveError) {
      setError(saveError.message || "Unable to save school profile.");
    } finally {
      setSchoolSaving(false);
    }
  }

  function openCreateModal() {
    setEditingStudent(null);
    setForm(initialForm);
    setError("");
    setIsModalOpen(true);
  }

  function openEditModal(student) {
    setEditingStudent(student);
    setForm({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone ?? "",
      grade: student.grade,
      section: student.section,
      status: student.status ?? "Active",
    });
    setError("");
    setIsModalOpen(true);
  }

  async function saveStudent(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const endpoint = editingStudent
      ? `${API_URL}/students/${editingStudent._id}`
      : `${API_URL}/students`;
    try {
      const response = await fetch(endpoint, {
        method: editingStudent ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to save student.");
      const data = result.data;
      if (editingStudent) {
        setStudents((current) =>
          current.map((student) => (student._id === data._id ? data : student)),
        );
      } else {
        setStudents((current) => [data, ...current]);
      }
      setIsModalOpen(false);
      setSuccess(editingStudent ? "Student updated successfully." : "Student added successfully.");
      await Promise.all([loadStudents(), loadDashboard()]);
    } catch (saveError) {
      setError(saveError.message || "Unable to save student.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteStudent(student) {
    if (!window.confirm(`Remove ${student.firstName} ${student.lastName} from the school?`)) {
      return;
    }
    setError("");
    try {
      const response = await fetch(`${API_URL}/students/${student._id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to remove student.");
      setStudents((current) => current.filter((item) => item._id !== student._id));
      setSuccess("Student removed successfully.");
      await Promise.all([loadStudents(), loadDashboard()]);
    } catch (deleteError) {
      setError(deleteError.message || "Unable to remove student.");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark"><Icon name="graduation" size={23} /></span>
          <span className="brand-name">scholar<span>.</span></span>
        </a>

        <button className="school-switcher" onClick={openSchoolSettings} type="button" aria-label="Edit school profile">
          <span className="school-emblem">{school?.schoolName?.[0]?.toUpperCase() ?? "S"}</span>
          <span className="school-details">
            <strong>{school?.schoolName || "Set up school profile"}</strong>
            <small>{school ? "School profile" : "Profile not configured"}</small>
          </span>
          <Icon name="edit" size={15} />
        </button>

        <div className="nav-caption">MENU</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              className={`nav-item${page === item.label ? " active" : ""}`}
              key={item.label}
              onClick={() => setPage(item.label)}
              type="button"
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.label === "Students" && (
                <span className="nav-count">{dashboard?.totalStudents ?? "—"}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="profile-button" onClick={openSchoolSettings} type="button">
            <span className="profile-avatar">{school?.administratorName?.[0]?.toUpperCase() ?? "?"}</span>
            <span className="profile-copy"><strong>{school?.administratorName || "Administrator not set"}</strong><small>{school?.administratorTitle || "School profile"}</small></span>
            <Icon name="edit" size={16} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>School</span><Icon name="chevron" size={14} /><strong>{page}</strong></div>
          <div className="topbar-right">
            <label className="global-search">
              <Icon name="search" size={17} />
              <input
                aria-label="Search students"
                onChange={(event) => { setSearch(event.target.value); setPagination((value) => ({ ...value, page: 1 })); }}
                placeholder="Search students..."
                value={search}
              />
              <kbd>⌘ K</kbd>
            </label>
            <span className="topbar-divider" />
            <span className="today-label">
              <Icon name="calendar" size={16} />
              {new Intl.DateTimeFormat("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              }).format(new Date())}
            </span>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">
                {new Intl.DateTimeFormat("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date()).toUpperCase()}
              </p>
              <h1>{page === "Dashboard" ? (school?.administratorName ? `Welcome, ${school.administratorName}` : "School dashboard") : "Student directory"}<span className="title-period">.</span></h1>
              <p className="welcome-copy">
                {page === "Dashboard"
                  ? school?.schoolName ? `Here’s what’s happening at ${school.schoolName} today.` : "Add your school details to complete the dashboard."
                  : "Keep track of your students and their enrollment details."}
              </p>
            </div>
            <button className="button button-primary" onClick={openCreateModal} type="button">
              <Icon name="plus" size={18} /> Add student
            </button>
          </section>

          {success && !isModalOpen && !schoolModalOpen && <div className="notice success-notice" role="status">{success}<button type="button" aria-label="Dismiss" onClick={() => setSuccess("")}>×</button></div>}
          {schoolLoaded && !school && !loading && page === "Dashboard" && <div className="notice profile-notice"><span>School profile is not configured yet.</span><button className="button button-secondary" onClick={openSchoolSettings} type="button">Add school details</button></div>}
          {error && !isModalOpen && !schoolModalOpen && (
            <div className="notice error-notice" role="alert">
              <Icon name="alert" size={18} />
              <span>{error}</span>
              <button type="button" onClick={loadStudents}>Try again</button>
            </div>
          )}

          <section className="stats-grid" aria-label="School overview">
            <article className="stat-card">
              <div className="stat-top"><span>Total students</span><span className="stat-icon violet"><Icon name="students" size={18} /></span></div>
              <div className="stat-value">{loading || !dashboard ? "—" : dashboard.totalStudents.toLocaleString()}</div>
              <div className="stat-foot"><span className="stat-note">Currently enrolled</span></div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>Active students</span><span className="stat-icon mint"><Icon name="people" size={18} /></span></div>
              <div className="stat-value">{loading || !dashboard ? "—" : activeCount.toLocaleString()}</div>
              <div className="stat-foot"><span className="stat-note">With active enrollment</span></div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>Classes</span><span className="stat-icon amber"><Icon name="graduation" size={18} /></span></div>
              <div className="stat-value">{loading || !dashboard ? "—" : classCount.toLocaleString()}</div>
              <div className="stat-foot"><span className="stat-note">Grades and sections</span></div>
            </article>
            <article className="stat-card stat-highlight">
              <div className="highlight-orb orb-one" />
              <div className="highlight-orb orb-two" />
              <div className="highlight-content">
                <span className="highlight-label">School year</span>
                <strong>{school?.academicYear || "Not set"}</strong>
                <span className="highlight-caption">Academic year</span>
              </div>
              <span className="highlight-icon"><Icon name="calendar" size={20} /></span>
            </article>
          </section>

          {page === "Dashboard" && (
            <section className="dashboard-grid">
              <article className="panel class-panel">
                <div className="panel-heading">
                  <div><h2>Enrollment overview</h2><p>Students by grade and section</p></div>
                  <span className="panel-badge"><Icon name="graduation" size={14} /> {school?.academicYear || "Academic year not set"}</span>
                </div>
                {loading ? (
                  <div className="loading-state">Loading enrollment data…</div>
                ) : dashboard?.gradeCounts?.length ? (
                  <div className="class-list">
                    {[...dashboard.gradeCounts].sort((a, b) => a.grade.localeCompare(b.grade, undefined, { numeric: true })).map(({ grade, students: count }) => {
                        const percent = dashboard.totalStudents ? Math.round((count / dashboard.totalStudents) * 100) : 0;
                        return (
                          <div className="class-row" key={grade}>
                            <div className="class-row-label"><span>{grade}</span><strong>{count} students</strong></div>
                            <div className="progress-track"><span style={{ width: `${percent}%` }} /></div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="empty-chart">
                    <span className="empty-chart-icon"><Icon name="graduation" size={22} /></span>
                    <strong>Your classes will appear here</strong>
                    <p>Add students to see enrollment by grade.</p>
                    <button type="button" onClick={openCreateModal}>Add your first student <Icon name="chevron" size={15} /></button>
                  </div>
                )}
              </article>

              <article className="panel activity-panel">
                <div className="panel-heading">
                  <div><h2>Recently enrolled</h2><p>Your latest student records</p></div>
                  <button className="text-button" type="button" onClick={() => setPage("Students")}>View all <Icon name="chevron" size={15} /></button>
                </div>
                {loading ? (
                  <div className="loading-state">Loading students…</div>
                ) : dashboard?.recentStudents?.length ? (
                  <div className="recent-list">
                    {dashboard.recentStudents.map((student, index) => (
                      <div className="recent-item" key={student._id}>
                        <span className={`student-avatar avatar-${index % 5}`}>{initials(student)}</span>
                        <span className="recent-copy"><strong>{student.firstName} {student.lastName}</strong><small>{student.grade} · Section {student.section}</small></span>
                        <span className={`status-dot${student.status === "Active" ? " is-active" : ""}`} title={student.status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-recent"><span>No student records yet.</span><button type="button" onClick={openCreateModal}>Add a student</button></div>
                )}
                <div className="activity-footer"><span className="live-dot" /> Data updates as students are added</div>
              </article>
            </section>
          )}

          <section className="panel students-panel">
            <div className="students-heading">
              <div><h2>{page === "Dashboard" ? "Student directory" : "All students"}</h2><p>Manage and view your student records</p></div>
              <div className="table-actions">
                <label className="filter-select">
                  <select aria-label="Filter students by status" onChange={(event) => { setStatusFilter(event.target.value); setPagination((value) => ({ ...value, page: 1 })); }} value={statusFilter}>
                    <option>All students</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                  <Icon name="down" size={15} />
                </label>
                <button className="button button-secondary" onClick={openCreateModal} type="button"><Icon name="plus" size={17} /> Add student</button>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>{[["firstName", "STUDENT"], ["studentId", "STUDENT ID"], ["grade", "GRADE & SECTION"], ["enrollmentDate", "ENROLLED"], ["status", "STATUS"]].map(([field, label]) => <th key={field}><button className="sort-button" type="button" onClick={() => { setSort((current) => ({ by: field, order: current.by === field && current.order === "asc" ? "desc" : "asc" })); setPagination((value) => ({ ...value, page: 1 })); }} aria-label={`Sort by ${label}`}>{label}{sort.by === field ? (sort.order === "asc" ? " ↑" : " ↓") : ""}</button></th>)}<th aria-label="Actions" /></tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="table-message" colSpan="6">Loading student records…</td></tr>
                  ) : filteredStudents.length ? (
                    (page === "Dashboard" ? filteredStudents.slice(0, 5) : filteredStudents).map((student, index) => (
                      <tr key={student._id}>
                        <td><div className="student-cell"><span className={`student-avatar avatar-${index % 5}`}>{initials(student)}</span><span><strong>{student.firstName} {student.lastName}</strong><small>{student.email}</small></span></div></td>
                        <td><span className="student-id">{student.studentId}</span></td>
                        <td><span className="grade-pill">{student.grade}<span>·</span>{student.section}</span></td>
                        <td className="date-cell">{formatDate(student.enrollmentDate)}</td>
                        <td><span className={`status-pill${student.status === "Active" ? " active-status" : " inactive-status"}`}><span />{student.status}</span></td>
                        <td><div className="row-actions"><button aria-label={`View ${student.firstName} ${student.lastName}`} onClick={() => setViewingStudent(student)} type="button"><span aria-hidden="true">ⓘ</span></button><button aria-label={`Edit ${student.firstName} ${student.lastName}`} onClick={() => openEditModal(student)} type="button"><Icon name="edit" size={16} /></button><button aria-label={`Remove ${student.firstName} ${student.lastName}`} onClick={() => deleteStudent(student)} type="button"><Icon name="trash" size={16} /></button></div></td>
                      </tr>
                    ))
                  ) : (
                    <tr><td className="table-message" colSpan="6">
                      <span>{search || statusFilter !== "All students" ? "No students match your search." : "No students yet. Add a student to get started."}</span>
                      {!search && statusFilter === "All students" && <button type="button" onClick={openCreateModal}>Add student</button>}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {!loading && filteredStudents.length > 0 && (
              <div className="table-footer">
                <span>Showing <strong>{page === "Dashboard" ? Math.min(5, filteredStudents.length) : filteredStudents.length}</strong> of <strong>{pagination.total}</strong> students</span>
                {page === "Students" && pagination.totalPages > 1 && <div className="pagination-controls"><button type="button" disabled={pagination.page <= 1} onClick={() => setPagination((value) => ({ ...value, page: value.page - 1 }))}>Previous</button><span>Page {pagination.page} of {pagination.totalPages}</span><button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((value) => ({ ...value, page: value.page + 1 }))}>Next</button></div>}
                {page === "Dashboard" && pagination.total > 5 && <button className="text-button" type="button" onClick={() => setPage("Students")}>View all students <Icon name="chevron" size={15} /></button>}
              </div>
            )}
          </section>

          <footer className="page-footer"><span>© {new Date().getFullYear()} Scholar School Management</span><span>Made for better learning <span className="footer-heart">♥</span></span></footer>
        </div>
      </main>

      {schoolModalOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSchoolModalOpen(false); }}>
          <section aria-labelledby="school-modal-title" aria-modal="true" className="student-modal" role="dialog">
            <div className="modal-heading"><div><span className="modal-icon"><Icon name="graduation" size={20} /></span><div><h2 id="school-modal-title">School profile</h2><p>These details are stored in the database.</p></div></div><button aria-label="Close dialog" className="icon-button" onClick={() => setSchoolModalOpen(false)} type="button"><Icon name="close" size={19} /></button></div>
            <form onSubmit={saveSchool}>
              <div className="form-grid">
                <label className="full-field">School name<input autoFocus maxLength="120" onChange={(event) => setSchoolForm({ ...schoolForm, schoolName: event.target.value })} required value={schoolForm.schoolName} /></label>
                <label>Administrator name<input maxLength="100" onChange={(event) => setSchoolForm({ ...schoolForm, administratorName: event.target.value })} required value={schoolForm.administratorName} /></label>
                <label>Administrator title<input maxLength="80" onChange={(event) => setSchoolForm({ ...schoolForm, administratorTitle: event.target.value })} required value={schoolForm.administratorTitle} /></label>
                <label className="full-field">Academic year<input maxLength="30" onChange={(event) => setSchoolForm({ ...schoolForm, academicYear: event.target.value })} placeholder="Optional" value={schoolForm.academicYear} /></label>
              </div>
              {error && <p className="form-error" role="alert"><Icon name="alert" size={16} />{error}</p>}
              <div className="modal-actions"><button className="button button-secondary" onClick={() => setSchoolModalOpen(false)} type="button">Cancel</button><button className="button button-primary" disabled={schoolSaving} type="submit">{schoolSaving ? "Saving…" : "Save profile"}</button></div>
            </form>
          </section>
        </div>
      )}

      {viewingStudent && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setViewingStudent(null); }}>
          <section aria-labelledby="student-details-title" aria-modal="true" className="student-modal" role="dialog">
            <div className="modal-heading"><div><span className="modal-icon"><Icon name="students" size={20} /></span><div><h2 id="student-details-title">Student details</h2><p>{viewingStudent.studentId}</p></div></div><button aria-label="Close dialog" className="icon-button" onClick={() => setViewingStudent(null)} type="button"><Icon name="close" size={19} /></button></div>
            <dl className="details-grid">{[["Name", `${viewingStudent.firstName} ${viewingStudent.lastName}`], ["Email", viewingStudent.email], ["Phone", viewingStudent.phone || "—"], ["Grade", viewingStudent.grade], ["Section", viewingStudent.section], ["Status", viewingStudent.status], ["Enrolled", formatDate(viewingStudent.enrollmentDate)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            <div className="modal-actions"><button className="button button-secondary" onClick={() => setViewingStudent(null)} type="button">Close</button><button className="button button-primary" onClick={() => { setViewingStudent(null); openEditModal(viewingStudent); }} type="button">Edit student</button></div>
          </section>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsModalOpen(false);
        }}>
          <section aria-labelledby="student-modal-title" aria-modal="true" className="student-modal" role="dialog">
            <div className="modal-heading">
              <div><span className="modal-icon"><Icon name="students" size={20} /></span><div><h2 id="student-modal-title">{editingStudent ? "Edit student" : "Add a student"}</h2><p>{editingStudent ? "Update this student's information." : "Enter student details to add them to your school."}</p></div></div>
              <button aria-label="Close dialog" className="icon-button" onClick={() => setIsModalOpen(false)} type="button"><Icon name="close" size={19} /></button>
            </div>
            <form className="student-form" onSubmit={saveStudent}>
              <div className="form-grid">
                <label>First name<input autoFocus autoComplete="given-name" maxLength="50" onChange={(event) => setForm({ ...form, firstName: event.target.value })} required value={form.firstName} /></label>
                <label>Last name<input autoComplete="family-name" maxLength="50" onChange={(event) => setForm({ ...form, lastName: event.target.value })} required value={form.lastName} /></label>
                <label className="full-field">Email address<input autoComplete="email" maxLength="254" onChange={(event) => setForm({ ...form, email: event.target.value })} required type="email" value={form.email} /></label>
                <label>Phone number<input autoComplete="tel" maxLength="25" onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Optional" value={form.phone} /></label>
                <label>Grade<input maxLength="30" onChange={(event) => setForm({ ...form, grade: event.target.value })} placeholder="e.g. Grade 5" required value={form.grade} /></label>
                <label>Section<input maxLength="20" onChange={(event) => setForm({ ...form, section: event.target.value })} placeholder="e.g. A" required value={form.section} /></label>
                <label>Status<select onChange={(event) => setForm({ ...form, status: event.target.value })} value={form.status ?? "Active"}><option>Active</option><option>Inactive</option></select></label>
              </div>
              {error && <p className="form-error" role="alert"><Icon name="alert" size={16} />{error}</p>}
              <div className="modal-actions">
                <button className="button button-secondary" onClick={() => setIsModalOpen(false)} type="button">Cancel</button>
                <button className="button button-primary" disabled={saving} type="submit">{saving ? "Saving…" : editingStudent ? "Save changes" : "Add student"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

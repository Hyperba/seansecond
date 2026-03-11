"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import s from "../shared.module.css";

type Question = {
  id: string;
  question_group: string;
  question_order: number;
  question_text: string;
};

type QuestionGroup = {
  id: string;
  name: string;
  sort_order: number;
};

type SurveyResponse = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  responses: Record<string, boolean>;
};

const EMPTY: Omit<Question, "id"> = {
  question_group: "",
  question_order: 1,
  question_text: "",
};

export default function SurveyPage() {
  const { canWrite } = useAdmin();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [responseCount, setResponseCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Question | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [newGroupMode, setNewGroupMode] = useState(false);
  const [modalWarning, setModalWarning] = useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [reorderingGroups, setReorderingGroups] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [surveyRes, responsesRes, groupsRes] = await Promise.all([
        fetch("/api/admin/survey"),
        fetch("/api/admin/survey-responses"),
        fetch("/api/admin/question-groups"),
      ]);
      
      if (!surveyRes.ok) throw new Error("Failed to load questions");
      const surveyData = await surveyRes.json();
      setQuestions(surveyData.questions);
      setResponseCount(surveyData.responseCount);

      if (responsesRes.ok) {
        const responsesData = await responsesRes.json();
        setResponses(responsesData.responses ?? []);
      }

      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setQuestionGroups(groupsData.groups ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Use questionGroups order if available, otherwise fall back to derived groups
  const groups = questionGroups.length > 0
    ? questionGroups.map(g => g.name)
    : Array.from(new Set(questions.map((q) => q.question_group)));

  // Check for duplicate order in group
  const checkDuplicateOrder = (group: string, order: number): boolean => {
    const editingId = editing?.id;
    return questions.some(
      (q) =>
        q.question_group === group &&
        q.question_order === order &&
        q.id !== editingId,
    );
  };

  const openCreate = () => {
    setEditing(null);
    setNewGroupMode(false);
    setModalWarning(null);
    const defaultGroup = groups[0] ?? "";
    const groupQs = questions.filter((q) => q.question_group === defaultGroup);
    const nextOrder = groupQs.length > 0 ? Math.max(...groupQs.map((q) => q.question_order)) + 1 : 1;
    setForm({ ...EMPTY, question_group: defaultGroup, question_order: nextOrder });
    setCreating(true);
  };

  const openEdit = (q: Question) => {
    setCreating(false);
    setNewGroupMode(false);
    setModalWarning(null);
    setEditing(q);
    setForm({
      question_group: q.question_group,
      question_order: q.question_order,
      question_text: q.question_text,
    });
  };

  const closeModal = () => {
    setEditing(null);
    setCreating(false);
    setNewGroupMode(false);
    setModalWarning(null);
    setForm(EMPTY);
  };

  const handleGroupChange = (value: string) => {
    const groupQs = questions.filter((q) => q.question_group === value);
    const nextOrder = groupQs.length > 0 ? Math.max(...groupQs.map((q) => q.question_order)) + 1 : 1;
    setForm({ ...form, question_group: value, question_order: nextOrder });
    setModalWarning(null);
  };

  const handleOrderChange = (order: number) => {
    setForm({ ...form, question_order: order });
    if (checkDuplicateOrder(form.question_group, order)) {
      setModalWarning(`Order #${order} already exists in "${form.question_group}". This will create a conflict.`);
    } else {
      setModalWarning(null);
    }
  };

  const handleSave = async () => {
    if (checkDuplicateOrder(form.question_group, form.question_order)) {
      const confirmed = confirm(
        `Order #${form.question_order} already exists in "${form.question_group}". Save anyway?`,
      );
      if (!confirmed) return;
    }

    setSaving(true);
    setError(null);
    try {
      if (creating) {
        const res = await fetch("/api/admin/survey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || "Failed to create");
        }
        const { question } = await res.json();
        setQuestions((prev) => [...prev, question]);
      } else if (editing) {
        const res = await fetch("/api/admin/survey", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || "Failed to update");
        }
        setQuestions((prev) =>
          prev.map((q) => (q.id === editing.id ? { ...q, ...form } : q)),
        );
      }
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    await fetch(`/api/admin/survey?id=${id}`, { method: "DELETE" });
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const moveGroupUp = async (index: number) => {
    if (index === 0) return;
    const newGroups = [...questionGroups];
    [newGroups[index - 1], newGroups[index]] = [newGroups[index], newGroups[index - 1]];
    
    const updates = newGroups.map((g, i) => ({ id: g.id, sort_order: i }));
    setQuestionGroups(newGroups.map((g, i) => ({ ...g, sort_order: i })));
    
    await fetch("/api/admin/question-groups", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
  };

  const moveGroupDown = async (index: number) => {
    if (index === questionGroups.length - 1) return;
    const newGroups = [...questionGroups];
    [newGroups[index], newGroups[index + 1]] = [newGroups[index + 1], newGroups[index]];
    
    const updates = newGroups.map((g, i) => ({ id: g.id, sort_order: i }));
    setQuestionGroups(newGroups.map((g, i) => ({ ...g, sort_order: i })));
    
    await fetch("/api/admin/question-groups", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
  };

  if (loading) return <div className={s.loadingState}>Loading survey…</div>;

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Survey Editor</h1>
          <p className={s.pageDesc}>
            {questions.length} questions across {groups.length} groups ·{" "}
            {responseCount} responses collected
          </p>
        </div>
        <div className={s.headerActions}>
          {canWrite && (
            <>
              <button
                type="button"
                className={s.btnSecondary}
                onClick={() => setReorderingGroups(!reorderingGroups)}
              >
                {reorderingGroups ? "Done Reordering" : "Reorder Groups"}
              </button>
              <button type="button" className={s.btnPrimary} onClick={openCreate}>
                + Add Question
              </button>
            </>
          )}
        </div>
      </div>

      {/* Group Reordering UI */}
      {reorderingGroups && canWrite && (
        <div style={{ marginBottom: "var(--space-6)", background: "var(--color-background-alt)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-4)" }}>
          <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "var(--space-3)" }}>
            Drag to reorder question groups
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {questionGroups.map((group, idx) => (
              <div
                key={group.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  background: "var(--color-background)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-3) var(--space-4)",
                }}
              >
                <GripVertical size={16} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-primary)" }}>
                  {group.name}
                </span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginRight: "var(--space-2)" }}>
                  {questions.filter(q => q.question_group === group.name).length} questions
                </span>
                <button
                  type="button"
                  onClick={() => moveGroupUp(idx)}
                  disabled={idx === 0}
                  style={{
                    padding: "var(--space-1)",
                    background: "transparent",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    cursor: idx === 0 ? "not-allowed" : "pointer",
                    opacity: idx === 0 ? 0.4 : 1,
                  }}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveGroupDown(idx)}
                  disabled={idx === questionGroups.length - 1}
                  style={{
                    padding: "var(--space-1)",
                    background: "transparent",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    cursor: idx === questionGroups.length - 1 ? "not-allowed" : "pointer",
                    opacity: idx === questionGroups.length - 1 ? 0.4 : 1,
                  }}
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className={s.errorBanner}>{error}</div>}

      {groups.length === 0 ? (
        <div className={s.emptyState}>No questions yet.</div>
      ) : (
        groups.map((group) => {
          const groupQ = questions
            .filter((q) => q.question_group === group)
            .sort((a, b) => a.question_order - b.question_order);
          return (
            <div key={group} style={{ marginBottom: "var(--space-8)" }}>
              <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "var(--space-3)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                {group}
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 400, color: "var(--color-text-muted)" }}>
                  ({groupQ.length} questions)
                </span>
              </h3>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th style={{ width: 50 }}>#</th>
                      <th>Question</th>
                      <th style={{ width: 120 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupQ.map((q) => (
                      <tr key={q.id}>
                        <td>{q.question_order}</td>
                        <td style={{ color: "var(--color-text-primary)" }}>{q.question_text}</td>
                        <td>
                          {canWrite && (
                            <div style={{ display: "flex", gap: 6 }}>
                              <button type="button" className={`${s.btnSecondary} ${s.btnSmall}`} onClick={() => openEdit(q)}>Edit</button>
                              <button type="button" className={`${s.btnDanger} ${s.btnSmall}`} onClick={() => handleDelete(q.id)}>Delete</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}

      {/* ── Survey Analytics ── */}
      <div style={{ marginTop: "var(--space-12)", paddingTop: "var(--space-12)", borderTop: "2px solid var(--color-border)" }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "var(--space-2)" }}>
          Survey Analytics
        </h2>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", marginBottom: "var(--space-8)" }}>
          {responses.length} responses collected · {questions.length} questions across {groups.length} groups
        </p>

        {responses.length === 0 ? (
          <div className={s.emptyState}>No survey responses yet.</div>
        ) : (
          <>
            {/* Overall summary row */}
            {(() => {
              let totalYes = 0;
              let totalNo = 0;
              for (const r of responses) {
                if (r.responses && typeof r.responses === "object") {
                  for (const val of Object.values(r.responses)) {
                    if (val === true) totalYes++;
                    else if (val === false) totalNo++;
                  }
                }
              }
              const totalAnswers = totalYes + totalNo;
              const yesRate = totalAnswers > 0 ? ((totalYes / totalAnswers) * 100).toFixed(1) : "0";

              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
                  <div style={{ background: "var(--color-background-alt)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
                    <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--color-accent)", lineHeight: 1 }}>{responses.length}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-1)", fontWeight: 500 }}>Total Responses</div>
                  </div>
                  <div style={{ background: "var(--color-background-alt)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
                    <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "#38a169", lineHeight: 1 }}>{yesRate}%</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-1)", fontWeight: 500 }}>Average Yes Rate</div>
                  </div>
                  <div style={{ background: "var(--color-background-alt)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
                    <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "#38a169", lineHeight: 1 }}>{totalYes}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-1)", fontWeight: 500 }}>Total Yes Answers</div>
                  </div>
                  <div style={{ background: "var(--color-background-alt)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
                    <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "#e53e3e", lineHeight: 1 }}>{totalNo}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-1)", fontWeight: 500 }}>Total No Answers</div>
                  </div>
                </div>
              );
            })()}

            {/* Per-group, per-question breakdown */}
            {groups.map((group) => {
              const groupQuestions = questions
                .filter((q) => q.question_group === group)
                .sort((a, b) => a.question_order - b.question_order);

              // Group-level yes/no totals
              let groupYes = 0;
              let groupNo = 0;
              for (const r of responses) {
                if (!r.responses || typeof r.responses !== "object") continue;
                for (const q of groupQuestions) {
                  const val = r.responses[q.id];
                  if (val === true) groupYes++;
                  else if (val === false) groupNo++;
                }
              }
              const groupTotal = groupYes + groupNo;
              const groupYesPct = groupTotal > 0 ? (groupYes / groupTotal) * 100 : 0;
              const CIRC = 2 * Math.PI * 34; // circumference for r=34

              return (
                <div key={group} style={{ marginBottom: "var(--space-10)" }}>
                  {/* Group header with overall pie */}
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", marginBottom: "var(--space-5)" }}>
                    <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
                      <svg viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-background)" strokeWidth="10" />
                        <circle cx="40" cy="40" r="34" fill="none" stroke="#38a169" strokeWidth="10"
                          strokeDasharray={`${(groupYesPct / 100) * CIRC} ${CIRC}`}
                        />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "var(--color-text-primary)" }}>
                        {groupYesPct.toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--color-text-primary)" }}>{group}</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                        {groupYes} yes · {groupNo} no · {groupQuestions.length} questions
                      </div>
                    </div>
                  </div>

                  {/* Per-question rows */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    {groupQuestions.map((q) => {
                      let qYes = 0;
                      let qNo = 0;
                      for (const r of responses) {
                        if (!r.responses || typeof r.responses !== "object") continue;
                        const val = r.responses[q.id];
                        if (val === true) qYes++;
                        else if (val === false) qNo++;
                      }
                      const qTotal = qYes + qNo;
                      const qYesPct = qTotal > 0 ? (qYes / qTotal) * 100 : 0;
                      const miniCirc = 2 * Math.PI * 16;

                      return (
                        <div key={q.id} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", background: "var(--color-background-alt)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "var(--space-3) var(--space-4)" }}>
                          {/* Mini pie */}
                          <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
                            <svg viewBox="0 0 40 40" style={{ transform: "rotate(-90deg)" }}>
                              <circle cx="20" cy="20" r="16" fill="none" stroke="var(--color-background)" strokeWidth="6" />
                              <circle cx="20" cy="20" r="16" fill="none" stroke="#38a169" strokeWidth="6"
                                strokeDasharray={`${(qYesPct / 100) * miniCirc} ${miniCirc}`}
                              />
                            </svg>
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "var(--color-text-primary)" }}>
                              {qYesPct.toFixed(0)}%
                            </div>
                          </div>

                          {/* Question text */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)", lineHeight: 1.4 }}>{q.question_text}</div>
                          </div>

                          {/* Yes/No bar */}
                          <div style={{ width: 120, flexShrink: 0 }}>
                            <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "var(--color-background)" }}>
                              {qTotal > 0 && (
                                <>
                                  <div style={{ width: `${qYesPct}%`, background: "#38a169", transition: "width 0.3s" }} />
                                  <div style={{ width: `${100 - qYesPct}%`, background: "#e53e3e", transition: "width 0.3s" }} />
                                </>
                              )}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                              <span style={{ fontSize: 10, color: "#38a169", fontWeight: 600 }}>{qYes} yes</span>
                              <span style={{ fontSize: 10, color: "#e53e3e", fontWeight: 600 }}>{qNo} no</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Recent responses */}
            <div style={{ marginTop: "var(--space-4)" }}>
              <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>
                Recent Responses
              </h3>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Yes Rate</th>
                      <th>Date</th>
                      <th style={{ width: 80 }}>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.slice(0, 20).map((r) => {
                      let y = 0;
                      let n = 0;
                      if (r.responses && typeof r.responses === "object") {
                        for (const val of Object.values(r.responses)) {
                          if (val === true) y++;
                          else if (val === false) n++;
                        }
                      }
                      const total = y + n;
                      const rate = total > 0 ? ((y / total) * 100).toFixed(0) : "0";
                      return (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{r.name || "—"}</td>
                          <td>{r.email}</td>
                          <td>
                            <span style={{ fontWeight: 700, color: Number(rate) >= 60 ? "#38a169" : Number(rate) >= 40 ? "#dd6b20" : "#e53e3e" }}>
                              {rate}%
                            </span>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginLeft: 4 }}>({y}/{total})</span>
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>{new Date(r.created_at).toLocaleDateString()}</td>
                          <td>
                            <button
                              type="button"
                              className={`${s.btnSecondary} ${s.btnSmall}`}
                              onClick={() => setSelectedResponse(r)}
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {(creating || editing) && (
        <div className={s.modalBackdrop} onClick={closeModal}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>
              {creating ? "Add Question" : "Edit Question"}
            </h2>

            <div className={s.formGroup}>
              <label className={s.label}>Group</label>
              {newGroupMode ? (
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <input
                    className={s.input}
                    value={form.question_group}
                    onChange={(e) => setForm({ ...form, question_group: e.target.value })}
                    placeholder="Enter new group name"
                    autoFocus
                  />
                  <button
                    type="button"
                    className={`${s.btnSecondary} ${s.btnSmall}`}
                    onClick={() => { setNewGroupMode(false); handleGroupChange(groups[0] ?? ""); }}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <select
                    className={s.select}
                    value={form.question_group}
                    onChange={(e) => handleGroupChange(e.target.value)}
                  >
                    {groups.length === 0 && <option value="">No groups yet</option>}
                    {groups.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={`${s.btnSecondary} ${s.btnSmall}`}
                    onClick={() => { setNewGroupMode(true); setForm({ ...form, question_group: "" }); }}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    + New Group
                  </button>
                </div>
              )}
            </div>

            <div className={s.formGroup}>
              <label className={s.label}>Order</label>
              <input
                className={s.input}
                type="number"
                min={1}
                value={form.question_order}
                onChange={(e) => handleOrderChange(Number(e.target.value))}
              />
              {modalWarning && (
                <p style={{ fontSize: "var(--text-xs)", color: "#dd6b20", marginTop: 4 }}>
                  ⚠ {modalWarning}
                </p>
              )}
            </div>

            <div className={s.formGroup}>
              <label className={s.label}>Question Text</label>
              <textarea
                className={s.textarea}
                value={form.question_text}
                onChange={(e) => setForm({ ...form, question_text: e.target.value })}
              />
            </div>

            <div className={s.modalActions}>
              <button type="button" className={s.btnSecondary} onClick={closeModal}>
                Cancel
              </button>
              <button
                type="button"
                className={s.btnPrimary}
                disabled={saving || !form.question_group || !form.question_text}
                onClick={handleSave}
              >
                {saving ? "Saving…" : creating ? "Create" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Survey response detail modal ── */}
      {selectedResponse && (
        <div className={s.modalBackdrop} onClick={() => setSelectedResponse(null)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
              <div>
                <h2 className={s.modalTitle} style={{ marginBottom: 4 }}>{selectedResponse.name || "Anonymous"}</h2>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>{selectedResponse.email}</p>
              </div>
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginBottom: "var(--space-6)" }}>
              Submitted {new Date(selectedResponse.created_at).toLocaleString()}
            </div>

            {selectedResponse.responses && typeof selectedResponse.responses === "object" ? (
              <div style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-4)", maxHeight: 400, overflowY: "auto" }}>
                {Object.entries(selectedResponse.responses).map(([questionId, answer]) => {
                  const question = questions.find((q) => q.id === questionId);
                  const questionText = question?.question_text ?? questionId;
                  const isYes = answer === true;
                  return (
                    <div key={questionId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-3) 0", borderBottom: "1px solid var(--color-border)" }}>
                      <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", flex: 1, paddingRight: "var(--space-3)" }}>{questionText}</span>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "4px 12px",
                        fontSize: "var(--text-xs)",
                        fontWeight: 700,
                        borderRadius: "var(--radius-full)",
                        background: isYes ? "rgba(56, 161, 105, 0.1)" : "rgba(229, 62, 62, 0.1)",
                        color: isYes ? "#38a169" : "#e53e3e",
                        textTransform: "uppercase",
                        flexShrink: 0,
                      }}>
                        {isYes ? "YES" : "NO"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>No detailed answers available.</p>
            )}

            <div className={s.modalActions}>
              <button type="button" className={s.btnSecondary} onClick={() => setSelectedResponse(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

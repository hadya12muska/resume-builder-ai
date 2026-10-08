"use client";

import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { resumeTemplates } from "@/lib/templates";
import { Suspense } from "react";

type Experience = {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
};

type Education = {
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
};

type ResumeData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  photo: string;
};

type OnlineTemplate = { id:string; name:string; category:string; layout:"single"|"sidebar"|"split"; style:"minimal"|"modern"|"classic"|"bold"|"creative"; accent:string; };
type BuilderTemplate = (typeof resumeTemplates)[number] | OnlineTemplate;
const onlineCategories = ["ATS","Executive","Developer","Professional","Student","Academic","Creative","Minimal"];
const onlineTemplates: OnlineTemplate[] = [
  ["ATS","ATS Clean","single","minimal","#111111"],["ATS","ATS Modern","single","modern","#1f2937"],["ATS","ATS Professional","single","classic","#374151"],
  ["Executive","Executive Black","single","bold","#111111"],["Executive","Executive Navy","sidebar","bold","#172554"],["Executive","Executive Gold","single","classic","#7c5c20"],
  ["Developer","Developer Green","sidebar","modern","#14532d"],["Developer","Developer Terminal","split","creative","#166534"],["Developer","Developer Dark","sidebar","bold","#0f172a"],
  ["Professional","Professional Slate","single","modern","#334155"],["Professional","Professional Blue","single","classic","#1d4ed8"],["Professional","Professional Clean","single","minimal","#475569"],
  ["Student","Student Fresh","single","modern","#1e3a5f"],["Student","Student Simple","single","minimal","#2563eb"],["Student","Student Sidebar","sidebar","modern","#0f766e"],
  ["Academic","Academic Classic","single","classic","#292524"],["Academic","Academic Research","single","minimal","#44403c"],["Academic","Academic Two Column","split","classic","#57534e"],
  ["Creative","Creative Violet","split","creative","#7c3aed"],["Creative","Creative Coral","single","bold","#c2410c"],["Creative","Creative Teal","sidebar","creative","#0f766e"],
  ["Minimal","Minimal Air","single","minimal","#262626"],["Minimal","Minimal Line","single","minimal","#525252"],["Minimal","Minimal Mono","single","modern","#18181b"]
].map(([category,name,layout,style,accent],i)=>({id:`online-${i+1}`,name,category,layout:layout as OnlineTemplate["layout"],style:style as OnlineTemplate["style"],accent}));

type ResumePaperProps = {
  resume: ResumeData;
  template: BuilderTemplate;
  resumeRef: {
    current: HTMLDivElement | null;
  };
};

const defaultResume: ResumeData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  website: "",
  summary: "",
  experience: [
    {
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ],
  education: [
    {
      school: "",
      degree: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ],
  skills: [],
  photo: "",
};

/* -------------------------------------------------------
   SAMPLE CV
------------------------------------------------------- */

const sampleResume: ResumeData = {
  firstName: "John",
  lastName: "Anderson",
  email: "john.anderson@email.com",
  phone: "+1 555 123 4567",
  location: "New York, NY",
  linkedin: "linkedin.com/in/johnanderson",
  website: "johnanderson.dev",
  photo: "",
  summary:
    "Motivated software developer with experience building responsive web applications and improving digital products. Strong problem-solving skills with a focus on clean, user-friendly solutions.",
  experience: [
    {
      company: "Tech Solutions",
      role: "Software Developer",
      startDate: "2023",
      endDate: "Present",
      description:
        "Built responsive web applications using modern technologies. Improved application performance and collaborated with designers and developers to deliver reliable digital products.",
    },
    {
      company: "Digital Works",
      role: "Junior Developer",
      startDate: "2021",
      endDate: "2023",
      description:
        "Developed user interfaces, fixed software issues, and supported the development of new features across multiple web projects.",
    },
  ],
  education: [
    {
      school: "State University",
      degree: "B.S. Computer Science",
      startDate: "2017",
      endDate: "2021",
      description:
        "Focused on software development, databases, web technologies, and computer systems.",
    },
  ],
  skills: [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Git",
    "SQL",
  ],
};

function BuilderPageContent() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");

  const [resume, setResume] = useState<ResumeData>(defaultResume);

  const [selectedTemplate, setSelectedTemplate] = useState<BuilderTemplate>(resumeTemplates[0]);

  const [loading, setLoading] = useState(false);
  const [loadingResume, setLoadingResume] = useState(Boolean(resumeId));
  const [saving, setSaving] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [activeSection, setActiveSection] = useState("personal");

  const [templateMode, setTemplateMode] = useState<"all" | "online">("all");
  const [onlineCategory, setOnlineCategory] = useState("ATS");

  /*
    This is ONLY for temporary hover preview.
    It does NOT change the selected template.
  */
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(
    null
  );

  const resumePaperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!resumeId) {
      setLoadingResume(false);
      return;
    }

    loadResume(resumeId);
  }, [resumeId]);

  async function loadResume(id: string) {
    try {
      setLoadingResume(true);
      setError("");

      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (data?.data) {
        setResume({
          ...defaultResume,
          ...data.data,
          experience: Array.isArray(data.data.experience)
            ? data.data.experience
            : defaultResume.experience,
          education: Array.isArray(data.data.education)
            ? data.data.education
            : defaultResume.education,
          skills: Array.isArray(data.data.skills) ? data.data.skills : defaultResume.skills,
          photo: typeof data.data.photo === "string" ? data.data.photo : "",
        });
      }

      if (data?.template_id) {
        const foundTemplate = [...resumeTemplates, ...onlineTemplates].find(
          (template) => template.id === data.template_id
        );

        if (foundTemplate) {
          setSelectedTemplate(foundTemplate);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Could not load this resume.");
    } finally {
      setLoadingResume(false);
    }
  }

  function updateResume<K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K]
  ) {
    setResume((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateExperience(
    index: number,
    field: keyof Experience,
    value: string
  ) {
    setResume((current) => {
      const experience = [...current.experience];

      experience[index] = {
        ...experience[index],
        [field]: value,
      };

      return {
        ...current,
        experience,
      };
    });
  }

  function addExperience() {
    setResume((current) => ({
      ...current,
      experience: [
        ...current.experience,
        {
          company: "",
          role: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    }));
  }

  function removeExperience(index: number) {
    setResume((current) => ({
      ...current,
      experience: current.experience.filter(
        (_, experienceIndex) => experienceIndex !== index
      ),
    }));
  }

  function updateEducation(
    index: number,
    field: keyof Education,
    value: string
  ) {
    setResume((current) => {
      const education = [...current.education];

      education[index] = {
        ...education[index],
        [field]: value,
      };

      return {
        ...current,
        education,
      };
    });
  }

  function addEducation() {
    setResume((current) => ({
      ...current,
      education: [
        ...current.education,
        {
          school: "",
          degree: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    }));
  }

  function removeEducation(index: number) {
    setResume((current) => ({
      ...current,
      education: current.education.filter(
        (_, educationIndex) => educationIndex !== index
      ),
    }));
  }

  function updateSkills(value: string) {
    const skills = value
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    updateResume("skills", skills);
  }

  function getResumeText(section: string) {
    if (section === "summary") {
      return resume.summary;
    }

    if (section === "experience") {
      return resume.experience
        .map(
          (item) =>
            `${item.role}\n${item.company}\n${item.startDate} - ${item.endDate}\n${item.description}`
        )
        .join("\n\n");
    }

    if (section === "education") {
      return resume.education
        .map(
          (item) =>
            `${item.degree}\n${item.school}\n${item.startDate} - ${item.endDate}\n${item.description}`
        )
        .join("\n\n");
    }

    if (section === "skills") {
      return resume.skills.join(", ");
    }

    return "";
  }

  async function improveSection(section: string) {
    const text = getResumeText(section);

    if (!text.trim()) {
      setError("Please add some content before using AI improvement.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/improve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not improve this resume section."
        );
      }

      const improvedText = data.improvedText || "";

      if (section === "summary") {
        updateResume("summary", improvedText);
      }

      if (section === "experience") {
        updateExperience(0, "description", improvedText);
      }

      if (section === "education") {
        setResume((current) => ({
          ...current,
          education: current.education.map((item, index) =>
            index === 0
              ? {
                  ...item,
                  description: improvedText,
                }
              : item
          ),
        }));
      }

      if (section === "skills") {
        updateSkills(improvedText);
      }

      setMessage("AI improved your resume content.");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not improve this section."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveResume() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You must be signed in to save a resume.");
        return;
      }

      const fullName = `${resume.firstName} ${resume.lastName}`.trim();

      const title = fullName ? `${fullName}'s Resume` : "My Resume";

      if (resumeId) {
        const { error: updateError } = await supabase
          .from("resumes")
          .update({
            title,
            data: resume,
            template_id: selectedTemplate.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", resumeId)
          .eq("user_id", user.id);

        if (updateError) {
          throw updateError;
        }

        setMessage("Resume updated successfully.");
      } else {
        const { data, error: insertError } = await supabase
          .from("resumes")
          .insert({
            user_id: user.id,
            title,
            data: resume,
            template_id: selectedTemplate.id,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        setMessage("Resume saved successfully.");

        if (data?.id) {
          window.history.replaceState(
            null,
            "",
            `/builder?id=${data.id}`
          );
        }
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Could not save your resume."
      );
    } finally {
      setSaving(false);
    }
  }

  async function downloadPDF() {
  if (!resumePaperRef.current) {
    setError("Resume preview is not ready yet.");
    return;
  }

  try {
    setDownloadingPDF(true);
    setError("");
    setMessage("");

    await new Promise((resolve) => setTimeout(resolve, 100));

    const element = resumePaperRef.current;

    const fullName = `${resume.firstName} ${resume.lastName}`.trim();

    const fileName = fullName
      ? `${fullName.replace(/\s+/g, "-")}-Resume.pdf`
      : "ResumeAI-Resume.pdf";

    // Create an isolated copy of the resume
    const clone = element.cloneNode(true) as HTMLElement;

    clone.style.position = "absolute";
    clone.style.left = "-100000px";
    clone.style.top = "0";
    clone.style.width = "794px";
    clone.style.minWidth = "794px";
    clone.style.maxWidth = "794px";
    clone.style.backgroundColor = "#ffffff";
    clone.style.overflow = "visible";

    document.body.appendChild(clone);

    // Wait for the cloned resume to render
    await new Promise((resolve) => setTimeout(resolve, 200));

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: clone.scrollWidth,
      height: clone.scrollHeight,
      windowWidth: 794,
      allowTaint: false,
    });

    document.body.removeChild(clone);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;

    const canvasWidth = canvas.width;
    const pageHeightPixels = Math.floor(
      (canvasWidth * pageHeight) / pageWidth
    );

    let yOffset = 0;
    let pageNumber = 0;

    while (yOffset < canvas.height) {
      const sliceHeight = Math.min(
        pageHeightPixels,
        canvas.height - yOffset
      );

      const pageCanvas = document.createElement("canvas");

      pageCanvas.width = canvasWidth;
      pageCanvas.height = sliceHeight;

      const context = pageCanvas.getContext("2d");

      if (!context) {
        throw new Error("Could not create PDF canvas.");
      }

      context.fillStyle = "#ffffff";
      context.fillRect(
        0,
        0,
        pageCanvas.width,
        pageCanvas.height
      );

      context.drawImage(
        canvas,
        0,
        yOffset,
        canvasWidth,
        sliceHeight,
        0,
        0,
        canvasWidth,
        sliceHeight
      );

      const imageData = pageCanvas.toDataURL(
        "image/jpeg",
        0.98
      );

      const renderedHeight =
        (sliceHeight / canvasWidth) * pageWidth;

      if (pageNumber > 0) {
        pdf.addPage("a4", "portrait");
      }

      pdf.addImage(
        imageData,
        "JPEG",
        0,
        0,
        pageWidth,
        renderedHeight,
        undefined,
        "FAST"
      );

      yOffset += sliceHeight;
      pageNumber++;

      pageCanvas.width = 1;
      pageCanvas.height = 1;
    }

    pdf.save(fileName);

    setMessage("High-quality PDF downloaded successfully.");
  } catch (err) {
    console.error("PDF generation error:", err);
    setError("Could not create the PDF. Please try again.");
  } finally {
    setDownloadingPDF(false);
  }
}

  /*
    If the user hasn't entered anything yet, show the sample CV.
    Once they enter their own information, show their CV.
  */
  const hasResumeContent =
    Boolean(
      resume.firstName ||
        resume.lastName ||
        resume.email ||
        resume.phone ||
        resume.location ||
        resume.linkedin ||
        resume.website ||
        resume.summary ||
        resume.skills.length > 0 ||
        resume.experience.some(
          (item) =>
            item.company ||
            item.role ||
            item.startDate ||
            item.endDate ||
            item.description
        ) ||
        resume.education.some(
          (item) =>
            item.school ||
            item.degree ||
            item.startDate ||
            item.endDate ||
            item.description
        )
    );

  const previewResume = hasResumeContent ? resume : sampleResume;

  const previewTemplate = previewTemplateId
    ? [...resumeTemplates, ...onlineTemplates].find((template) => template.id === previewTemplateId) || selectedTemplate
    : selectedTemplate;

  if (loadingResume) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] text-[#171717]">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black/20 border-t-black" />

            <p className="mt-4 text-sm text-[#666]">
              Loading your resume...
            </p>
          </div>
        </div>
      </main>
    );
  }

  const visibleTemplates: BuilderTemplate[] = templateMode === "all" ? resumeTemplates : onlineTemplates.filter((template) => template.category === onlineCategory);

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#171717]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f7f7f5]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-5">
            <a
              href="/dashboard"
              className="text-sm font-medium text-[#666] transition hover:text-black"
            >
              ← Dashboard
            </a>

            <div className="hidden h-5 w-px bg-black/10 sm:block" />

            <div className="text-xl font-bold tracking-tight">
              ResumeAI
              <span className="text-[#777]">.</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={saveResume}
              disabled={saving}
              className="rounded-full border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-black disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
            >
              {saving
                ? "Saving..."
                : resumeId
                ? "Update Resume"
                : "Save Resume"}
            </button>

            <button
              type="button"
              onClick={downloadPDF}
              disabled={downloadingPDF}
              className="rounded-full bg-[#171717] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
            >
              {downloadingPDF ? "Creating PDF..." : "Download PDF"}
            </button>
          </div>
        </div>
      </header>

      {(message || error) && (
        <div className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6">
          {message && (
            <div className="border border-black/10 bg-white px-4 py-3 text-sm text-[#555]">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      )}

      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1fr)_820px]">
        <section className="min-w-0">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#777]">
              Resume builder
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
              Build your professional resume
            </h1>

            <p className="mt-2 text-sm text-[#666]">
              Add your experience, education and skills. Use AI to improve
              your wording.
            </p>
          </div>

          <div className="mb-6 flex flex-wrap gap-2 border-b border-black/10 pb-3">
            {[
              ["personal", "Personal"],
              ["photo", "Photo"],
              ["summary", "Summary"],
              ["experience", "Experience"],
              ["education", "Education"],
              ["skills", "Skills"],
              ["templates", "Templates"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeSection === id
                    ? "bg-[#171717] text-white"
                    : "bg-white text-[#666] hover:text-black"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeSection === "personal" && (
            <EditorCard
              title="Personal information"
              description="Add the contact details you want employers to see."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="First name"
                  value={resume.firstName}
                  onChange={(value) => updateResume("firstName", value)}
                  placeholder="John"
                />

                <Input
                  label="Last name"
                  value={resume.lastName}
                  onChange={(value) => updateResume("lastName", value)}
                  placeholder="Smith"
                />

                <Input
                  label="Email"
                  value={resume.email}
                  onChange={(value) => updateResume("email", value)}
                  placeholder="john@example.com"
                />

                <Input
                  label="Phone"
                  value={resume.phone}
                  onChange={(value) => updateResume("phone", value)}
                  placeholder="+93 700 000 000"
                />

                <Input
                  label="Location"
                  value={resume.location}
                  onChange={(value) => updateResume("location", value)}
                  placeholder="Kabul, Afghanistan"
                />

                <Input
                  label="LinkedIn"
                  value={resume.linkedin}
                  onChange={(value) => updateResume("linkedin", value)}
                  placeholder="linkedin.com/in/yourname"
                />

                <div className="sm:col-span-2">
                  <Input
                    label="Website"
                    value={resume.website}
                    onChange={(value) => updateResume("website", value)}
                    placeholder="yourwebsite.com"
                  />
                </div>
              </div>
            </EditorCard>
          )}

          {activeSection === "photo" && (
            <EditorCard title="Profile photo" description="Upload JPG, PNG or WEBP up to 5 MB. The photo will appear on your resume.">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-40 w-32 shrink-0 items-center justify-center overflow-hidden rounded-md border border-black/10 bg-[#f3f4f6]">
                  {resume.photo ? <img src={resume.photo} alt="Profile" className="h-full w-full object-cover" /> : <span className="text-xs text-[#888]">No photo</span>}
                </div>
                <div>
                  <label className="inline-flex cursor-pointer rounded-full bg-[#171717] px-5 py-3 text-sm font-semibold text-white">
                    Upload photo
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => { const file=event.target.files?.[0]; if(!file)return; if(file.size>5*1024*1024){setError("Photo must be smaller than 5 MB.");return;} const reader=new FileReader(); reader.onload=()=>{if(typeof reader.result==="string") updateResume("photo",reader.result);}; reader.readAsDataURL(file); }} />
                  </label>
                  {resume.photo && <button type="button" onClick={()=>updateResume("photo","")} className="ml-2 rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold">Remove</button>}
                </div>
              </div>
            </EditorCard>
          )}

          {activeSection === "summary" && (
            <EditorCard
              title="Professional summary"
              description="Give employers a quick overview of who you are and what you offer."
              action={
                <button
                  type="button"
                  onClick={() => improveSection("summary")}
                  disabled={loading}
                  className="rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-semibold transition hover:border-black disabled:opacity-50"
                >
                  {loading ? "Improving..." : "Improve with AI"}
                </button>
              }
            >
              <textarea
                value={resume.summary}
                onChange={(event) =>
                  updateResume("summary", event.target.value)
                }
                rows={8}
                placeholder="Write a concise professional summary..."
                className="w-full resize-y border border-black/15 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-black"
              />
            </EditorCard>
          )}

          {activeSection === "experience" && (
            <div className="space-y-6">
              {resume.experience.map((experience, index) => (
                <EditorCard
                  key={index}
                  title={`Experience ${index + 1}`}
                  description="Describe your role and focus on measurable impact."
                  action={
                    resume.experience.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    ) : undefined
                  }
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      label="Job title"
                      value={experience.role}
                      onChange={(value) =>
                        updateExperience(index, "role", value)
                      }
                      placeholder="Software Developer"
                    />

                    <Input
                      label="Company"
                      value={experience.company}
                      onChange={(value) =>
                        updateExperience(index, "company", value)
                      }
                      placeholder="Company name"
                    />

                    <Input
                      label="Start date"
                      value={experience.startDate}
                      onChange={(value) =>
                        updateExperience(index, "startDate", value)
                      }
                      placeholder="Jan 2024"
                    />

                    <Input
                      label="End date"
                      value={experience.endDate}
                      onChange={(value) =>
                        updateExperience(index, "endDate", value)
                      }
                      placeholder="Present"
                    />

                    <div className="sm:col-span-2">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <label className="text-sm font-medium">
                          Description
                        </label>

                        <button
                          type="button"
                          onClick={() => improveSection("experience")}
                          disabled={loading}
                          className="text-xs font-semibold underline underline-offset-4 disabled:opacity-50"
                        >
                          {loading ? "Improving..." : "Improve with AI"}
                        </button>
                      </div>

                      <textarea
                        value={experience.description}
                        onChange={(event) =>
                          updateExperience(
                            index,
                            "description",
                            event.target.value
                          )
                        }
                        rows={7}
                        placeholder="Describe your responsibilities and achievements..."
                        className="w-full resize-y border border-black/15 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-black"
                      />
                    </div>
                  </div>
                </EditorCard>
              ))}

              <button
                type="button"
                onClick={addExperience}
                className="w-full border border-dashed border-black/20 bg-white px-5 py-4 text-sm font-semibold transition hover:border-black"
              >
                + Add another experience
              </button>
            </div>
          )}

          {activeSection === "education" && (
            <div className="space-y-6">
              {resume.education.map((education, index) => (
                <EditorCard
                  key={index}
                  title={`Education ${index + 1}`}
                  description="Add your academic background."
                  action={
                    resume.education.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    ) : undefined
                  }
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      label="Degree"
                      value={education.degree}
                      onChange={(value) =>
                        updateEducation(index, "degree", value)
                      }
                      placeholder="Bachelor of Computer Science"
                    />

                    <Input
                      label="School"
                      value={education.school}
                      onChange={(value) =>
                        updateEducation(index, "school", value)
                      }
                      placeholder="University name"
                    />

                    <Input
                      label="Start date"
                      value={education.startDate}
                      onChange={(value) =>
                        updateEducation(index, "startDate", value)
                      }
                      placeholder="2021"
                    />

                    <Input
                      label="End date"
                      value={education.endDate}
                      onChange={(value) =>
                        updateEducation(index, "endDate", value)
                      }
                      placeholder="2025"
                    />

                    <div className="sm:col-span-2">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <label className="text-sm font-medium">
                          Description
                        </label>

                        <button
                          type="button"
                          onClick={() => improveSection("education")}
                          disabled={loading}
                          className="text-xs font-semibold underline underline-offset-4 disabled:opacity-50"
                        >
                          {loading ? "Improving..." : "Improve with AI"}
                        </button>
                      </div>

                      <textarea
                        value={education.description}
                        onChange={(event) =>
                          updateEducation(
                            index,
                            "description",
                            event.target.value
                          )
                        }
                        rows={5}
                        placeholder="Relevant coursework, achievements, activities..."
                        className="w-full resize-y border border-black/15 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-black"
                      />
                    </div>
                  </div>
                </EditorCard>
              ))}

              <button
                type="button"
                onClick={addEducation}
                className="w-full border border-dashed border-black/20 bg-white px-5 py-4 text-sm font-semibold transition hover:border-black"
              >
                + Add another education
              </button>
            </div>
          )}

          {activeSection === "skills" && (
            <EditorCard
              title="Skills"
              description="Separate each skill with a comma."
              action={
                <button
                  type="button"
                  onClick={() => improveSection("skills")}
                  disabled={loading}
                  className="rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-semibold transition hover:border-black disabled:opacity-50"
                >
                  {loading ? "Improving..." : "Improve with AI"}
                </button>
              }
            >
              <textarea
                value={resume.skills.join(", ")}
                onChange={(event) => updateSkills(event.target.value)}
                rows={5}
                placeholder="JavaScript, React, Next.js, TypeScript, Git..."
                className="w-full resize-y border border-black/15 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-black"
              />

              {resume.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {resume.skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-full bg-[#f0f0ed] px-3 py-1.5 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </EditorCard>
          )}

          {activeSection === "templates" && (
            <EditorCard
              title="Choose a template"
              description="Hover to preview. Click to apply the template."
            >
              <div className="mb-5 flex flex-wrap gap-2">
                <button type="button" onClick={()=>setTemplateMode("all")} className={`rounded-full px-4 py-2 text-xs font-semibold ${templateMode === "all" ? "bg-[#171717] text-white" : "border border-black/10 bg-white text-[#666]"}`}>My templates</button>
                <button type="button" onClick={()=>setTemplateMode("online")} className={`rounded-full px-4 py-2 text-xs font-semibold ${templateMode === "online" ? "bg-[#171717] text-white" : "border border-black/10 bg-white text-[#666]"}`}>Online templates</button>
              </div>

              {templateMode === "online" && (
                <div className="mb-6 overflow-x-auto">
                  <div className="flex min-w-max gap-2 border-b border-black/10 pb-2">
                    {onlineCategories.map((category)=>(
                      <button key={category} type="button" onClick={()=>setOnlineCategory(category)} className={`rounded-lg px-4 py-2.5 text-xs font-bold ${onlineCategory===category ? "bg-[#171717] text-white" : "bg-[#f3f4f6] text-[#555]"}`}>{category}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onMouseEnter={() => {
                      setPreviewTemplateId(template.id);
                    }}
                    onMouseLeave={() => {
                      setPreviewTemplateId(null);
                    }}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setPreviewTemplateId(null);
                      setMessage(`${template.name} selected.`);
                    }}
                    className={`group overflow-hidden border bg-white text-left transition ${
                      selectedTemplate.id === template.id
                        ? "border-black ring-2 ring-black"
                        : "border-black/10 hover:border-black/40"
                    }`}
                  >
                    <div className="aspect-[4/5] bg-[#f1f1ee] p-4">
                      <div
                        className={`h-full bg-white p-4 shadow-sm ${
                          template.layout === "sidebar"
                            ? "grid grid-cols-[30%_1fr] gap-2"
                            : template.layout === "split"
                            ? "grid grid-cols-2 gap-2"
                            : ""
                        }`}
                      >
                        {template.layout === "sidebar" && (
                          <div
                            className="h-full"
                            style={{
                              backgroundColor: template.accent,
                            }}
                          />
                        )}

                        <div
                          className={
                            template.layout === "sidebar"
                              ? ""
                              : "col-span-full"
                          }
                        >
                          <div
                            className="h-2 w-1/2"
                            style={{
                              backgroundColor: template.accent,
                            }}
                          />

                          <div className="mt-3 h-1.5 w-4/5 bg-black/15" />
                          <div className="mt-2 h-1.5 w-3/5 bg-black/10" />

                          <div className="mt-5 h-1 w-1/3 bg-black/15" />

                          <div className="mt-2 space-y-1.5">
                            <div className="h-1 bg-black/10" />
                            <div className="h-1 bg-black/10" />
                            <div className="h-1 w-4/5 bg-black/10" />
                          </div>

                          <div className="mt-5 h-1 w-1/3 bg-black/15" />

                          <div className="mt-2 space-y-1.5">
                            <div className="h-1 bg-black/10" />
                            <div className="h-1 w-4/5 bg-black/10" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-black/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">
                            {template.name}
                          </p>

                          <p className="mt-1 text-xs text-[#777]">
                            {template.category}
                          </p>
                        </div>

                        {selectedTemplate.id === template.id && (
                          <span className="rounded-full bg-[#171717] px-2.5 py-1 text-[10px] font-semibold text-white">
                            Selected
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-xs text-[#777]">
                        Hover to preview · Click to apply
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </EditorCard>
          )}
        </section>

        <aside className="min-w-0">
          <div className="sticky top-[89px]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#777]">
                  Live preview
                </p>

                <p className="mt-1 text-sm text-[#666]">
                  {previewTemplate.name}
                  {previewTemplateId ? " · Previewing" : " · Selected"}
                </p>
              </div>

              <button
                type="button"
                onClick={downloadPDF}
                disabled={downloadingPDF}
                className="text-xs font-semibold underline underline-offset-4 disabled:opacity-50"
              >
                {downloadingPDF ? "Preparing..." : "Download"}
              </button>
            </div>

            <div className="overflow-x-auto overflow-y-auto border border-black/10 bg-[#dededb] p-3 shadow-sm sm:p-6">
              <div className="flex min-w-[794px] justify-center">
                <ResumePaper
                  resume={previewResume}
                  template={previewTemplate}
                  resumeRef={resumePaperRef}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function EditorCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-black/10 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>

          {description && (
            <p className="mt-1 text-sm leading-6 text-[#777]">
              {description}
            </p>
          )}
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
      />
    </div>
  );
}

function ResumePaper({
  resume,
  template,
  resumeRef,
}: ResumePaperProps) {
  const fullName =
    `${resume.firstName} ${resume.lastName}`.trim() || "Your Name";

  const accent = template.accent || "#171717";

  const filledExperience = resume.experience.filter(
    (item) => item.company || item.role || item.description
  );

  const filledEducation = resume.education.filter(
    (item) => item.school || item.degree || item.description
  );

  const isClassic = template.style === "classic";
  const isModern = template.style === "modern";
  const isBold = template.style === "bold";
  const isCreative = template.style === "creative";
  const isMinimal = template.style === "minimal";

  const paperStyle: React.CSSProperties = {
    fontFamily: isClassic
      ? "Georgia, serif"
      : isMinimal && template.id.includes("mono")
      ? "ui-monospace, SFMono-Regular, Menlo, monospace"
      : "Arial, Helvetica, sans-serif",
    borderTop: isBold ? `10px solid ${accent}` : undefined,
  };

  return (
    <div
      ref={resumeRef}
      className="w-[794px] min-h-[1123px] shrink-0 bg-white text-[#171717]"
      style={paperStyle}
    >
      {template.layout === "sidebar" ? (
        <div className="grid min-h-[1123px] grid-cols-[235px_1fr]">
          <aside
            className="p-8 text-white"
            style={{
              backgroundColor: accent,
              backgroundImage: isCreative
                ? `linear-gradient(145deg, ${accent}, #111827)`
                : undefined,
            }}
          >
            {resume.photo ? (
              <img
                src={resume.photo}
                alt="Profile"
                className="mb-6 h-28 w-24 rounded-md object-cover"
              />
            ) : (
              <div
                className="mb-6 flex h-28 w-24 items-center justify-center rounded-md border border-white/30 bg-white/10 text-2xl font-bold"
              >
                {fullName.charAt(0)}
              </div>
            )}

            <h1 className="break-words text-3xl font-bold leading-tight">
              {fullName}
            </h1>

            <div className="mt-8 space-y-3 text-sm leading-5 text-white/85">
              {resume.email && <p className="break-words">{resume.email}</p>}
              {resume.phone && <p>{resume.phone}</p>}
              {resume.location && <p>{resume.location}</p>}
              {resume.linkedin && <p className="break-words">{resume.linkedin}</p>}
              {resume.website && <p className="break-words">{resume.website}</p>}
            </div>

            {resume.skills.length > 0 && (
              <section className="mt-10">
                <h2 className="text-xs font-bold uppercase tracking-[0.18em]">
                  Skills
                </h2>
                <div className="mt-4 space-y-2 text-sm text-white/90">
                  {resume.skills.map((skill, index) => (
                    <p key={index}>{skill}</p>
                  ))}
                </div>
              </section>
            )}
          </aside>

          <main className={`p-10 ${isMinimal ? "pt-12" : ""}`}>
            <ResumeMainContent
              resume={resume}
              accent={accent}
              fullName={fullName}
              filledExperience={filledExperience}
              filledEducation={filledEducation}
            />
          </main>
        </div>
      ) : template.layout === "split" ? (
        <div className="min-h-[1123px] grid grid-cols-[1.05fr_.95fr]">
          <section
            className="p-10 text-white"
            style={{
              backgroundColor: accent,
              backgroundImage: isCreative
                ? `linear-gradient(155deg, ${accent}, #111827)`
                : undefined,
            }}
          >
            {resume.photo ? (
              <img
                src={resume.photo}
                alt="Profile"
                className="mb-7 h-28 w-24 rounded-md object-cover"
              />
            ) : (
              <div className="mb-7 flex h-28 w-24 items-center justify-center rounded-md border border-white/30 bg-white/10 text-2xl font-bold">
                {fullName.charAt(0)}
              </div>
            )}

            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">
              Resume
            </p>
            <h1
              className={`mt-3 break-words font-bold leading-[0.95] ${
                isCreative || isBold ? "text-6xl" : "text-5xl"
              }`}
            >
              {fullName}
            </h1>

            <div className="mt-8 space-y-2 text-sm text-white/80">
              {resume.email && <p className="break-words">{resume.email}</p>}
              {resume.phone && <p>{resume.phone}</p>}
              {resume.location && <p>{resume.location}</p>}
            </div>
          </section>

          <main className={`p-10 ${isClassic ? "font-serif" : ""}`}>
            <div className="mb-8 border-b pb-5" style={{ borderColor: accent }}>
              <p
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: accent }}
              >
                Professional Profile
              </p>
              {resume.linkedin && (
                <p className="mt-2 break-words text-xs text-[#666]">
                  {resume.linkedin}
                </p>
              )}
              {resume.website && (
                <p className="mt-1 break-words text-xs text-[#666]">
                  {resume.website}
                </p>
              )}
            </div>
            <ResumeMainContent
              resume={resume}
              accent={accent}
              fullName={fullName}
              filledExperience={filledExperience}
              filledEducation={filledEducation}
            />
          </main>
        </div>
      ) : (
        <main className={`p-10 ${isMinimal ? "pt-12" : ""}`}>
          <header
            className={`border-b pb-7 ${
              isBold ? "border-black pb-8" : "border-black/15"
            } ${isCreative ? "pb-10" : ""}`}
            style={{
              borderColor: isMinimal ? "#e5e5e5" : accent,
            }}
          >
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0 flex-1">
                <p
                  className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em]"
                  style={{ color: accent }}
                >
                  Professional Resume
                </p>
                <h1
                  className={`break-words font-bold tracking-tight ${
                    isCreative || isBold
                      ? "text-5xl"
                      : isMinimal
                      ? "text-[38px]"
                      : "text-4xl"
                  }`}
                  style={{ color: accent }}
                >
                  {fullName}
                </h1>
              </div>

              {resume.photo ? (
                <img
                  src={resume.photo}
                  alt="Profile"
                  className="h-28 w-24 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div
                  className="flex h-28 w-24 shrink-0 items-center justify-center rounded-md border-2 text-2xl font-bold"
                  style={{ borderColor: accent, color: accent }}
                >
                  {fullName.charAt(0)}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#666]">
              {resume.email && <span>{resume.email}</span>}
              {resume.phone && <span>{resume.phone}</span>}
              {resume.location && <span>{resume.location}</span>}
              {resume.linkedin && <span>{resume.linkedin}</span>}
              {resume.website && <span>{resume.website}</span>}
            </div>
          </header>

          <ResumeMainContent
            resume={resume}
            accent={accent}
            fullName={fullName}
            filledExperience={filledExperience}
            filledEducation={filledEducation}
          />
        </main>
      )}
    </div>
  );
}

function ResumeMainContent({
  resume,
  accent,
  fullName,
  filledExperience,
  filledEducation,
}: {
  resume: ResumeData;
  accent: string;
  fullName: string;
  filledExperience: Experience[];
  filledEducation: Education[];
}) {
  return (
    <div className="pt-7">
      {resume.summary && (
        <ResumeSection title="Professional Summary" accent={accent}>
          <p className="text-[13px] leading-6 text-[#444]">
            {resume.summary}
          </p>
        </ResumeSection>
      )}

      {filledExperience.length > 0 && (
        <ResumeSection title="Experience" accent={accent}>
          <div className="space-y-6">
            {filledExperience.map((experience, index) => (
              <div key={index}>
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-bold">
                      {experience.role || "Position"}
                    </h3>

                    <p
                      className="mt-1 text-[13px] font-semibold"
                      style={{
                        color: accent,
                      }}
                    >
                      {experience.company || "Company"}
                    </p>
                  </div>

                  {(experience.startDate || experience.endDate) && (
                    <p className="shrink-0 text-[11px] text-[#777]">
                      {experience.startDate}
                      {experience.startDate || experience.endDate
                        ? " — "
                        : ""}
                      {experience.endDate}
                    </p>
                  )}
                </div>

                {experience.description && (
                  <p className="mt-2 whitespace-pre-line text-[12px] leading-5 text-[#555]">
                    {experience.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ResumeSection>
      )}

      {filledEducation.length > 0 && (
        <ResumeSection title="Education" accent={accent}>
          <div className="space-y-5">
            {filledEducation.map((education, index) => (
              <div key={index}>
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-bold">
                      {education.degree || "Degree"}
                    </h3>

                    <p
                      className="mt-1 text-[12px] font-semibold"
                      style={{
                        color: accent,
                      }}
                    >
                      {education.school || "School"}
                    </p>
                  </div>

                  {(education.startDate || education.endDate) && (
                    <p className="shrink-0 text-[11px] text-[#777]">
                      {education.startDate}
                      {education.startDate || education.endDate
                        ? " — "
                        : ""}
                      {education.endDate}
                    </p>
                  )}
                </div>

                {education.description && (
                  <p className="mt-2 whitespace-pre-line text-[12px] leading-5 text-[#555]">
                    {education.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ResumeSection>
      )}

      {resume.skills.length > 0 && (
        <ResumeSection title="Skills" accent={accent}>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill, index) => (
              <span
                key={index}
                className="border border-black/10 px-3 py-1.5 text-[11px]"
              >
                {skill}
              </span>
            ))}
          </div>
        </ResumeSection>
      )}

      {!resume.summary &&
        filledExperience.length === 0 &&
        filledEducation.length === 0 &&
        resume.skills.length === 0 && (
          <div className="flex min-h-[600px] items-center justify-center text-center text-[#999]">
            <div>
              <p className="text-lg font-medium">
                {fullName === "Your Name"
                  ? "Your resume preview"
                  : `${fullName}'s resume`}
              </p>

              <p className="mt-2 text-sm">
                Start filling in your information to see it here.
              </p>
            </div>
          </div>
        )}
    </div>
  );
}

function ResumeSection({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-7">
      <div className="mb-3 flex items-center gap-3">
        <h2
          className="text-[11px] font-bold uppercase tracking-[0.18em]"
          style={{
            color: accent,
          }}
        >
          {title}
        </h2>

        <div
          className="h-px flex-1"
          style={{
            backgroundColor: `${accent}33`,
          }}
        />
      </div>

      {children}
    </section>
  );
}

function html2pdf() {
  throw new Error("Function not implemented.");
}
export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f7f5]" />}>
      <BuilderPageContent />
    </Suspense>
  );
}
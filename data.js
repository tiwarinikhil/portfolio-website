/*
  All the words on the site live in this file.
  To change something, edit the text between the quotes and save.
  To add a project, copy one { ... } block inside "projects", paste it, and change the text.
*/
window.SITE = {
  name: "Nikhil Kumar Tiwary",
  shortName: "Nikhil Tiwary",
  role: "AI Engineer",
  location: "Bangalore, India",
  email: "nikhiltiwarijt2015@gmail.com",

  // Your phone number is on your resume. It stays off the website unless you set showPhone to true.
  phone: "+91 7814244072",
  showPhone: false,

  linkedin: "https://www.linkedin.com/in/nikhil-tiwary007/",
  github: "https://github.com/tiwarinikhil",
  // The resume PDF is not in the GitHub repo. To show a "Resume (PDF)" button, put the PDF next to
  // index.html and write its file name here, e.g. "Nikhil-Kumar-Tiwary-Resume.pdf". Leave it empty to hide the button.
  resumeFile: "",

  // Paste your Formspree form address here once you create it (see the launch guide).
  // Example: "https://formspree.io/f/abcdwxyz"
  formEndpoint: "https://formspree.io/f/xgaajkkr",

  headline: "I build LLM systems that run in production.",
  intro:
    "AI Engineer with 2+ years shipping production LLM systems, plus 2 years of AI research at IIT Ropar. " +
    "Right now I work on RAG search over 300K+ CVs and job descriptions, a voice AI interviewer, and a proctoring model that runs on the candidate's own device.",
  availability: "Taking on a few freelance projects. I reply within a few hours (IST).",

  stats: [
    { value: "300K+", label: "CVs and JDs in the matching index I built" },
    { value: "100", label: "live voice interviews running at once on AWS" },
    { value: "~73 ms", label: "latency for on-device proctoring" },
    { value: "98.70", label: "GATE 2022 percentile in CS (AIR 934)" }
  ],

  // Tags used for the project filter buttons. Every project's tags should come from this list.
  tags: ["RAG", "Agents", "Voice", "Vision", "LLM fine-tuning", "Research"],

  projects: [
    {
      title: "Two-way RAG matching engine",
      where: "Welocity.ai",
      year: "2026",
      kind: "Work",
      tags: ["RAG"],
      metric: "96%",
      metricLabel: "matching accuracy",
      summary:
        "Matches CVs to job descriptions and job descriptions to CVs over a Pinecone index of 300K+ documents, serving daily candidate and job matching.",
      details: [
        "I own the embedding and ingestion pipeline that keeps the index fresh every day.",
        "Scheduled jobs on AWS Lambda and cron handle the daily refresh."
      ],
      stack: ["Pinecone", "Embeddings", "AWS Lambda", "Python"]
    },
    {
      title: "Voice AI interview agent",
      where: "Welocity.ai",
      year: "2026",
      kind: "Work",
      tags: ["Agents", "Voice"],
      metric: "100",
      metricLabel: "concurrent interviews",
      summary:
        "A multi-turn voice interviewer that adapts its questions to any job description.",
      details: [
        "Built on OpenAI LLMs with ElevenLabs voice.",
        "Deployed on AWS (EC2, S3, Lambda) to handle 100 concurrent live interviews."
      ],
      stack: ["OpenAI", "ElevenLabs", "AWS EC2", "S3"]
    },
    {
      title: "On-device proctoring model",
      where: "Welocity.ai",
      year: "2026",
      kind: "Work",
      tags: ["Vision"],
      metric: "13",
      metricLabel: "integrity signals tracked",
      summary:
        "Designed and built from scratch. It runs fully on the candidate's device, so it adds no server load, at about 73 ms latency.",
      details: [
        "Combines D-FINE, MediaPipe Face and Hand Landmarkers, and OpenCV YuNet and SFace."
      ],
      stack: ["D-FINE", "MediaPipe", "OpenCV"]
    },
    {
      title: "MCP server for a production database",
      where: "Welocity.ai",
      year: "2026",
      kind: "Work",
      tags: ["Agents"],
      metric: "MCP",
      metricLabel: "Claude Code to PostgreSQL",
      summary:
        "A Python MCP server that connects Claude Code to the company's AWS-hosted PostgreSQL, so the team can query and run daily database tasks in plain language through agent tool calls.",
      details: [],
      stack: ["Python", "MCP", "PostgreSQL", "AWS"]
    },
    {
      title: "Automated sports commentary",
      where: "4Brains Technologies",
      year: "2024 to 2026",
      kind: "Work",
      tags: ["LLM fine-tuning"],
      metric: "8B",
      metricLabel: "LLaMA-3.1 fine-tuned",
      summary:
        "Fine-tuned LLaMA-3.1-8B to write real-time commentary from model-predicted match features, powering a fully automated narration pipeline.",
      details: [],
      stack: ["LLaMA-3.1-8B", "Fine-tuning", "PyTorch"]
    },
    {
      title: "Multimodal sports analytics",
      where: "4Brains Technologies",
      year: "2024 to 2026",
      kind: "Work",
      tags: ["Vision"],
      metric: "95%",
      metricLabel: "action classification",
      summary:
        "Player tracking, pose estimation and action classification from video and depth cameras.",
      details: ["Built with MediaPipe, OAK-D, 3D-CNNs and U-Net."],
      stack: ["MediaPipe", "OAK-D", "3D-CNN", "U-Net"]
    },
    {
      title: "RAG chunking experiment",
      where: "Open source",
      year: "2026",
      kind: "Open source",
      tags: ["RAG"],
      metric: "79 → 100%",
      metricLabel: "Hit@1 on 24 questions",
      summary:
        "Same model, same BM25 search, same questions. Splitting the document by headings instead of fixed sizes took right-passage-first from 79% to 100%.",
      details: [
        "Fixed 300 characters: 79%. Fixed 800 characters: 88%. Split by headings: 100%.",
        "Each chunk carries its heading path, for example \"Leave Policy > Sick leave\"."
      ],
      stack: ["Python", "BM25", "Eval set"],
      link: "https://github.com/tiwarinikhil/ai-portfolio"
    },
    {
      title: "AI research agent",
      where: "Open source",
      year: "",
      kind: "Open source",
      tags: ["Agents"],
      metric: "2",
      metricLabel: "LLMs routed at runtime",
      summary:
        "A ReAct agent that runs multi-step web searches through Tavily and returns summaries with citations.",
      details: [
        "A routing layer switches between GPT-4o and Groq Llama 3.3 70B.",
        "Step-by-step reasoning logs trace every answer to its sources."
      ],
      stack: ["LangChain", "Groq", "OpenAI", "Tavily", "Gradio"],
      link: "https://github.com/tiwarinikhil/ai-research-agent"
    },
    {
      title: "YouTube knowledge base",
      where: "Open source",
      year: "",
      kind: "Open source",
      tags: ["RAG", "Voice"],
      metric: "Timestamps",
      metricLabel: "every answer links to the moment",
      summary:
        "Transcribes YouTube videos with Whisper at segment level and answers questions with deep links to the moment in the video.",
      details: [
        "FAISS and sentence-transformers for search, with caching across audio, transcripts and embeddings.",
        "Swappable LLM layer: Ollama Llama 3 or GPT-4o-mini."
      ],
      stack: ["Whisper", "FAISS", "LangChain", "Ollama"],
      link: "https://github.com/tiwarinikhil/yt-knowledge-base"
    },
    {
      title: "Resume tailor",
      where: "Open source",
      year: "",
      kind: "Open source",
      tags: ["Agents"],
      metric: "< 60 s",
      metricLabel: "per tailored resume",
      summary:
        "Tailors a .docx resume to a job description. Llama 3.3 70B rewrites in structured JSON and Llama 4 Scout reads job descriptions from screenshots.",
      details: [
        "Grounding checks compare every rewritten bullet with the original, so the model cannot invent metrics or skills."
      ],
      stack: ["Groq", "Llama 3.3 70B", "Llama 4 Scout", "JSON Schema"],
      link: "https://github.com/tiwarinikhil/resume-tailor"
    },
    {
      title: "Video event localization",
      where: "IIT Ropar",
      year: "2022 to 2024",
      kind: "Research",
      tags: ["Research", "Vision"],
      metric: "+2%",
      metricLabel: "over state of the art",
      summary:
        "Timeline segmentation and event localization with CLIP and Transformers on ActivityNet (20K videos, 850 classes), reaching 46% localization accuracy.",
      details: [
        "A related BART + CLIP pipeline gave 30% better semantic understanding of sports events than CNN-RNN baselines."
      ],
      stack: ["CLIP", "Transformers", "BART", "PyTorch"]
    }
  ],

  experience: [
    {
      company: "Net Connect Global (Welocity.ai)",
      role: "AI Engineer",
      place: "Bangalore",
      dates: "July 2026 to now",
      points: [
        "Two-way RAG matching engine over 300K+ CVs and JDs on Pinecone, 96% accuracy.",
        "Daily embedding and ingestion pipeline on AWS Lambda and cron.",
        "Voice AI interview platform with OpenAI and ElevenLabs, 100 concurrent interviews on AWS.",
        "On-device proctoring model tracking 13 integrity signals at ~73 ms.",
        "Python MCP server connecting Claude Code to the company's PostgreSQL."
      ]
    },
    {
      company: "4Brains Technologies",
      role: "AI Engineer",
      place: "Bangalore",
      dates: "Sept 2024 to June 2026",
      points: [
        "Led end-to-end delivery of AI and GenAI work for international clients, helping drive a 25% increase in customer conversions.",
        "Fine-tuned LLaMA-3.1-8B for real-time sports commentary.",
        "Computer vision for player tracking, pose and action classification, up to 95% accuracy.",
        "Shipped text-to-speech, synthetic media and 3D face modeling for marketing and event clients.",
        "Production REST APIs and Python pipelines that replaced third-party tools."
      ]
    },
    {
      company: "Indian Institute of Technology Ropar",
      role: "Research Assistant",
      place: "Ropar",
      dates: "2022 to 2024",
      points: [
        "Video event localization with CLIP and Transformers on ActivityNet, 2% above state of the art.",
        "LLM video analysis with BART + CLIP, 30% better than CNN-RNN baselines on sports events."
      ]
    }
  ],

  services: [
    {
      title: "A chatbot that answers from your documents",
      text: "Your PDFs, website or Notion, with the source shown under every answer. Tested on real questions from your team before handover."
    },
    {
      title: "An AI agent for one real task",
      text: "Qualifying leads, drafting support replies, writing weekly reports. Connected to the tools you already use, with you approving anything important."
    },
    {
      title: "A fix for an LLM app that gives wrong answers",
      text: "I check chunking, retrieval and prompts one at a time, fix what is broken, and show test scores before and after."
    }
  ],

  skills: [
    { group: "LLMs and agents", items: ["LangChain", "LangGraph", "ReAct agents", "Tool use", "MCP", "Prompt engineering", "OpenAI API", "Groq API", "Ollama", "LLaMA fine-tuning"] },
    { group: "RAG and retrieval", items: ["Pinecone", "FAISS", "ChromaDB", "Embedding pipelines", "Semantic search", "Grounding"] },
    { group: "Speech and voice", items: ["Whisper", "ElevenLabs", "TTS"] },
    { group: "ML and vision", items: ["PyTorch", "Hugging Face Transformers", "scikit-learn", "YOLO", "MediaPipe", "OpenCV"] },
    { group: "Backend and cloud", items: ["FastAPI", "Flask", "Docker", "Git", "AWS EC2, S3, Lambda", "PostgreSQL", "MySQL"] },
    { group: "Languages", items: ["Python", "C++"] }
  ],

  education: [
    { school: "IIT Ropar", degree: "M.Tech in Artificial Intelligence", dates: "2022 to 2024" },
    { school: "Netaji Subhash Engineering College, Kolkata", degree: "B.Tech in Computer Science Engineering", dates: "2017 to 2021" }
  ],

  achievements: ["98.70 percentile in GATE 2022 (Computer Science), All India Rank 934."]
};

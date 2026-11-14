/**
 * Rozgar Jawan — Main Application Logic
 * Dynamic Job Feed, Filter Engine, Modal Controller, and AI Data Bridge
 */

// Sample preview data to demonstrate verified Pakistani job structure when preview is clicked
const SAMPLE_PREVIEW_JOBS = [
    {
        id: "pk-sbp-2026-01",
        title: "Assistant Director (OG-2)",
        organization: "State Bank of Pakistan (SBP)",
        city: "Karachi",
        sector: "Banking & Finance",
        category: "Banking & Finance",
        scale: "OG-2 (Competitive Pay)",
        education: "Master's or 16-Year Bachelor in Economics / Finance / IT",
        experience: "Fresh Graduates & 1-2 years experience eligible",
        deadline: "2026-12-15",
        verified: true,
        source: "Official SBP Career Portal",
        apply_url: "https://www.sbp.org.pk/careers",
        description: "State Bank of Pakistan invites applications from high-caliber Pakistani nationals for the position of Assistant Director under the State Bank Officers Training Scheme (SBOTS). Selected officers will undergo comprehensive central banking training.",
        requirements: [
            "Minimum 16 years of education with at least 60% marks or 2.5/4.0 CGPA",
            "Maximum age limit: 26 years (relaxable by 3 years for specific quotas)",
            "Strong analytical, quantitative, and written communication skills",
            "Must pass national written test conducted by testing agency"
        ]
    },
    {
        id: "pk-nitb-2026-02",
        title: "Senior Full-Stack Cloud Engineer",
        organization: "National Information Technology Board (NITB)",
        city: "Islamabad",
        sector: "IT & Tech",
        category: "IT & Tech",
        scale: "Market Competitive (MP-III Equivalent)",
        education: "BS / MS in Computer Science, Software Engineering or related",
        experience: "3+ years in Node.js, React / Next.js, and Cloud Infrastructure",
        deadline: "2026-11-30",
        verified: true,
        source: "NITB Government Portal",
        apply_url: "https://nitb.gov.pk/careers",
        description: "Join the digital transformation team of Pakistan. NITB is seeking talented software engineers to develop and deploy sovereign citizen-facing e-governance platforms and cloud architectures.",
        requirements: [
            "Proven experience designing scalable RESTful & GraphQL APIs",
            "Proficiency in modern JavaScript / TypeScript frameworks",
            "Experience with Docker, Kubernetes, and automated CI/CD pipelines",
            "Excellent problem-solving and clean code architecture skills"
        ]
    },
    {
        id: "pk-ppsc-2026-03",
        title: "Sub-Inspector / Assistant Superintendent (BPS-16)",
        organization: "Punjab Public Service Commission (PPSC)",
        city: "Lahore",
        sector: "Government",
        category: "Government",
        scale: "BPS-16 Regular Scale",
        education: "Graduate (14 or 16 Years) from HEC recognized university",
        experience: "Fresh Graduates welcome (Subject to Physical Standards)",
        deadline: "2026-12-05",
        verified: true,
        source: "PPSC Consolidated Advertisement No. 24/2026",
        apply_url: "https://www.ppsc.gop.pk",
        description: "Punjab Police Department through PPSC announces regular positions of Sub-Inspector. Candidates from all districts of Punjab holding valid domicile are eligible to apply through the online portal.",
        requirements: [
            "Bachelor's Degree (2nd Division) from an accredited university",
            "Physical Standard: Height 5' 7\" for male, 5' 2\" for female",
            "Visual Standards: Normal vision with or without glasses (6/6)",
            "Valid Punjab Domicile and Computerized CNIC"
        ]
    },
    {
        id: "pk-engro-2026-04",
        title: "Graduate Trainee Engineer (Chemical & Mechanical)",
        organization: "Engro Corporation",
        city: "Multan",
        sector: "Engineering",
        category: "Engineering",
        scale: "Corporate Trainee Package",
        education: "B.Sc. / BE in Chemical or Mechanical Engineering (PEC Registered)",
        experience: "Fresh Graduates (Class of 2025/2026)",
        deadline: "2026-11-28",
        verified: true,
        source: "Engro Corporate Careers Portal",
        apply_url: "https://www.engro.com/careers",
        description: "Engro's flagship Graduate Trainee Program offers hands-on operational leadership, rotation across premier manufacturing plants, and mentoring by top industrial engineering leaders in Pakistan.",
        requirements: [
            "PEC Registration is mandatory",
            "Minimum 3.0 CGPA in undergraduate engineering degree",
            "Demonstrated leadership in extracurricular or academic projects",
            "Willingness to work across manufacturing facilities"
        ]
    }
];

class RozgarJawanApp {
    constructor() {
        this.liveJobs = [];
        this.displayedJobs = [];
        this.isPreviewMode = false;
        this.activeCategory = 'all';

        this.dom = {
            jobsContainer: document.getElementById('jobs-container'),
            emptyState: document.getElementById('empty-state'),
            jobCountBadge: document.getElementById('job-count-badge'),
            searchInput: document.getElementById('job-search-input'),
            cityFilter: document.getElementById('city-filter'),
            typeFilter: document.getElementById('type-filter'),
            searchActionBtn: document.getElementById('search-action-btn'),
            chips: document.querySelectorAll('.chip'),
            toggleSampleBtn: document.getElementById('toggle-sample-btn'),
            sampleBtnText: document.getElementById('sample-btn-text'),
            triggerSampleView: document.getElementById('trigger-sample-view'),

            // Modal elements
            modal: document.getElementById('job-modal'),
            modalCloseBtn: document.getElementById('modal-close-btn'),
            modalJobTitle: document.getElementById('modal-job-title'),
            modalOrg: document.getElementById('modal-organization'),
            modalSectorBadge: document.getElementById('modal-sector-badge'),
            modalLocation: document.getElementById('modal-location'),
            modalScale: document.getElementById('modal-scale'),
            modalEducation: document.getElementById('modal-education'),
            modalDeadline: document.getElementById('modal-deadline'),
            modalDescription: document.getElementById('modal-description'),
            modalRequirements: document.getElementById('modal-requirements'),
            modalApplyBtn: document.getElementById('modal-apply-btn')
        };

        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadJobsData();
    }

    bindEvents() {
        // Search & Filter event listeners
        if (this.dom.searchInput) {
            this.dom.searchInput.addEventListener('input', () => this.applyFilters());
        }

        if (this.dom.cityFilter) {
            this.dom.cityFilter.addEventListener('change', () => this.applyFilters());
        }

        if (this.dom.typeFilter) {
            this.dom.typeFilter.addEventListener('change', () => this.applyFilters());
        }

        if (this.dom.searchActionBtn) {
            this.dom.searchActionBtn.addEventListener('click', () => {
                this.applyFilters();
                const feed = document.getElementById('jobs-section');
                if (feed) feed.scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Category Chips
        this.dom.chips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                this.dom.chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.activeCategory = chip.dataset.category;
                this.applyFilters();
            });
        });

        // Sample Preview Mode Toggles
        if (this.dom.toggleSampleBtn) {
            this.dom.toggleSampleBtn.addEventListener('click', () => this.togglePreviewMode());
        }

        if (this.dom.triggerSampleView) {
            this.dom.triggerSampleView.addEventListener('click', () => this.togglePreviewMode(true));
        }

        // Modal close
        if (this.dom.modalCloseBtn) {
            this.dom.modalCloseBtn.addEventListener('click', () => this.closeModal());
        }

        if (this.dom.modal) {
            this.dom.modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-backdrop')) {
                    this.closeModal();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.dom.modal.classList.contains('hidden')) {
                this.closeModal();
            }
        });
    }

    async loadJobsData() {
        try {
            const response = await fetch('data/jobs.json');
            if (response.ok) {
                const data = await response.json();
                this.liveJobs = Array.isArray(data) ? data : [];
            } else {
                this.liveJobs = [];
            }
        } catch (error) {
            console.warn('data/jobs.json is currently empty or loading in static environment:', error);
            this.liveJobs = [];
        }

        this.applyFilters();
    }

    togglePreviewMode(forceOn = null) {
        if (forceOn !== null) {
            this.isPreviewMode = forceOn;
        } else {
            this.isPreviewMode = !this.isPreviewMode;
        }

        if (this.isPreviewMode) {
            this.dom.sampleBtnText.textContent = "Clear to Clean Feed";
            this.dom.toggleSampleBtn.classList.add('btn-primary');
            this.dom.toggleSampleBtn.classList.remove('btn-outline');
            if (window.showToast) window.showToast("Displaying sample AI-verified job cards");
        } else {
            this.dom.sampleBtnText.textContent = "Preview AI Layout";
            this.dom.toggleSampleBtn.classList.remove('btn-primary');
            this.dom.toggleSampleBtn.classList.add('btn-outline');
            if (window.showToast) window.showToast("Switched back to clean live feed");
        }

        this.applyFilters();
    }

    applyFilters() {
        const sourceData = this.isPreviewMode ? SAMPLE_PREVIEW_JOBS : this.liveJobs;
        const searchQuery = (this.dom.searchInput ? this.dom.searchInput.value : '').toLowerCase().trim();
        const selectedCity = this.dom.cityFilter ? this.dom.cityFilter.value : '';
        const selectedSector = this.dom.typeFilter ? this.dom.typeFilter.value : '';

        this.displayedJobs = sourceData.filter(job => {
            // Text search
            const matchesText = !searchQuery || 
                job.title.toLowerCase().includes(searchQuery) ||
                job.organization.toLowerCase().includes(searchQuery) ||
                (job.description && job.description.toLowerCase().includes(searchQuery)) ||
                (job.city && job.city.toLowerCase().includes(searchQuery));

            // City filter
            const matchesCity = !selectedCity || 
                (job.city && job.city.toLowerCase().includes(selectedCity.toLowerCase())) ||
                (selectedCity === 'Remote' && (job.city === 'Remote' || job.title.toLowerCase().includes('remote')));

            // Sector filter from dropdown
            const matchesSector = !selectedSector || 
                (job.sector && job.sector.toLowerCase().includes(selectedSector.toLowerCase()));

            // Category filter from chips
            const matchesChip = this.activeCategory === 'all' || 
                (job.category && job.category.toLowerCase().includes(this.activeCategory.toLowerCase())) ||
                (job.sector && job.sector.toLowerCase().includes(this.activeCategory.toLowerCase()));

            return matchesText && matchesCity && matchesSector && matchesChip;
        });

        this.renderJobs();
    }

    renderJobs() {
        const container = this.dom.jobsContainer;
        const emptyState = this.dom.emptyState;
        const countBadge = this.dom.jobCountBadge;

        container.innerHTML = '';

        if (this.displayedJobs.length === 0) {
            emptyState.classList.remove('hidden');
            countBadge.textContent = '0 Openings Found';
            return;
        }

        emptyState.classList.add('hidden');
        countBadge.textContent = `${this.displayedJobs.length} Verified Opening${this.displayedJobs.length === 1 ? '' : 's'}`;

        this.displayedJobs.forEach((job, index) => {
            const card = document.createElement('article');
            card.className = 'job-card';
            card.style.animationDelay = `${index * 0.08}s`;

            // Calculate days left till deadline
            let deadlineHtml = '';
            if (job.deadline) {
                const deadlineDate = new Date(job.deadline);
                const today = new Date();
                const diffTime = deadlineDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 0) {
                    deadlineHtml = `<span class="meta-deadline">Last Date: <strong>${job.deadline}</strong> (${diffDays}d left)</span>`;
                } else if (diffDays === 0) {
                    deadlineHtml = `<span class="meta-deadline text-urgent">Last Date: <strong>Today!</strong></span>`;
                } else {
                    deadlineHtml = `<span class="meta-deadline">Deadline Passed</span>`;
                }
            }

            // Monogram for organization
            const orgInitials = job.organization 
                ? job.organization.split(' ').map(w => w[0]).slice(0, 3).join('') 
                : 'PK';

            card.innerHTML = `
                <div class="job-card-header">
                    <div class="job-org-logo">${orgInitials}</div>
                    <div class="job-header-info">
                        <div class="job-org-name">${this.escapeHtml(job.organization)}</div>
                        <h3 class="job-card-title">${this.escapeHtml(job.title)}</h3>
                    </div>
                </div>

                <div class="job-tags-row">
                    <span class="tag-badge tag-verified">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        AI Verified
                    </span>
                    <span class="tag-badge">📍 ${this.escapeHtml(job.city || 'Pakistan')}</span>
                    <span class="tag-badge">🏛️ ${this.escapeHtml(job.scale || job.sector)}</span>
                </div>

                <div class="job-card-meta">
                    ${deadlineHtml}
                    <button class="meta-action btn-detail-trigger" data-id="${job.id}">
                        View Details →
                    </button>
                </div>
            `;

            // Bind click to open detail modal
            card.querySelector('.btn-detail-trigger').addEventListener('click', (e) => {
                e.stopPropagation();
                this.openModal(job);
            });

            card.addEventListener('click', () => {
                this.openModal(job);
            });

            container.appendChild(card);
        });
    }

    openModal(job) {
        this.dom.modalJobTitle.textContent = job.title;
        this.dom.modalOrg.textContent = job.organization;
        this.dom.modalSectorBadge.textContent = job.sector || 'General';
        this.dom.modalLocation.textContent = job.city || 'Across Pakistan';
        this.dom.modalScale.textContent = job.scale || 'Not Specified';
        this.dom.modalEducation.textContent = job.education || 'See advertisement for requirements';
        this.dom.modalDeadline.textContent = job.deadline || 'Open until filled';
        this.dom.modalDescription.textContent = job.description || 'Full circular and qualifications available on the official portal.';

        // Requirements list
        this.dom.modalRequirements.innerHTML = '';
        if (job.requirements && Array.isArray(job.requirements)) {
            job.requirements.forEach(req => {
                const li = document.createElement('li');
                li.textContent = req;
                this.dom.modalRequirements.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = "Refer to the official advertisement announcement for detailed eligibility criteria.";
            this.dom.modalRequirements.appendChild(li);
        }

        // Apply URL
        if (job.apply_url) {
            this.dom.modalApplyBtn.href = job.apply_url;
            this.dom.modalApplyBtn.style.display = 'inline-flex';
        } else {
            this.dom.modalApplyBtn.style.display = 'none';
        }

        this.dom.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.dom.modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
}

// Instantiate on script execution
window.rozgarApp = new RozgarJawanApp();

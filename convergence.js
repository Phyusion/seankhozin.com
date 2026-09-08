// ================================================================
//  Convergence diagram — medicine, technology, and AI
//  Edit REGIONS to change copy or citations. Papers link by DOI;
//  posts link to insights.phyusionbio.com by slug.
// ================================================================
(function () {
  'use strict';

  var SUBSTACK = 'https://www.insights.phyusionbio.com/p/';

  var REGIONS = {
    med: {
      tag: 'Medicine',
      title: 'The substrate. Disease begins at the molecular level, and so does every cure.',
      lead: 'As a clinical investigator at the National Cancer Institute and later at the FDA, Dr. Khozin worked at the point where a mechanistic insight becomes a medicine: targeted therapy for EGFR and ALK, checkpoint immunotherapy, and the first drugs aimed at targets no one could see a generation ago.',
      body: [
        'But biology is stubbornly heterogeneous. Tumors in different organs share molecular features while tumors in the same organ diverge. Animal models predict human toxicity poorly. Trial populations rarely resemble the patients treated in clinic, and the endpoints trials measure do not always capture what a patient experiences.',
        'This body of work focuses on the biology of response and resistance, on endpoints that reflect clinical benefit, and on closing the gap between the trial and the patient.'
      ],
      papers: [
        { t: 'Osimertinib for the Treatment of Metastatic EGFR T790M Mutation-Positive Non-Small Cell Lung Cancer', a: 'Khozin S, Weinstock C, Blumenthal GM, et al.', j: 'Clinical Cancer Research, 2016', d: '10.1158/1078-0432.CCR-16-1773' },
        { t: 'Benefit-Risk Summary of Nivolumab for Patients With Metastatic Squamous Cell Lung Cancer After Platinum-Based Chemotherapy', a: 'Kazandjian D, Khozin S, Blumenthal G, et al.', j: 'JAMA Oncology, 2016', d: '10.1001/jamaoncol.2015.3934' },
        { t: 'Pre-Clinical Animal Models Are Poor Predictors of Human Toxicities in Phase 1 Oncology Clinical Trials', a: 'Atkins JT, George GC, Hess K, ... Khozin S, et al.', j: 'British Journal of Cancer, 2020', d: '10.1038/s41416-020-01033-x' },
        { t: 'A Novel Approach to Reducing Disparities in Health Outcomes by Enhancing Interpretation of Cancer Clinical Trials for Underrepresented Patient Groups', a: 'Khozin S, Stein RM.', j: 'BBA Reviews on Cancer, 2022', d: '10.1016/j.bbcan.2022.188825' },
        { t: 'Clinically Meaningful, Patient-Centered Endpoints for Real-World Evidence Generation in Breast Cancer: Perspectives from the Multidisciplinary TRIUMPH Initiative', a: 'Khozin S, Dreyer NA, Galante D, et al.', j: 'Advances in Therapy, 2026', d: '10.1007/s12325-026-03537-z' }
      ],
      posts: [
        { t: 'The Discipline of Precision', s: 'On Brian Druker, targets, mechanisms, and testing unfashionable ideas in humans', u: 'the-discipline-of-precision' },
        { t: 'Precision Signals: James Gulley, MD, PhD', s: 'With James Gulley on the limits of biomarkers, the opacity of resistance, and the architecture of evidence in immuno-oncology', u: 'precision-signals-james-gulley-md' },
        { t: 'Beyond Gold Standards: Sins of Omission and Sins of Commission', s: 'There are no gold standards in biomedicine, only methods that reached institutional consensus', u: 'beyond-gold-standards-sins-of-omission' },
        { t: 'Fifty Patients', s: 'How a fifty-patient single-arm study became evidence, and why regulatory standards emerge from consensus before they are written down', u: 'fifty-patients' }
      ]
    },
    tech: {
      tag: 'Technology',
      title: 'The instrument. Biology is now observed continuously, at resolutions that did not exist a decade ago.',
      lead: 'Electronic health records, genomic assays, imaging, wearables, and biometric sensors capture biological state at higher temporal resolution and through more modalities than at any point in history.',
      body: [
        'The constraint is no longer measurement. It is infrastructure: data that cannot move, cannot be linked, and cannot be reused. Institutions still handle information the way they did when a chart was made of paper.',
        'At the FDA, Dr. Khozin founded INFORMED, the agency’s first data science incubator, and helped establish real-world data as a legitimate source of clinical evidence, digital submissions and “smart data,” consensus data elements for genomic repositories, and open-access data sharing.'
      ],
      papers: [
        { t: 'Real-World Data for Clinical Evidence Generation in Oncology', a: 'Khozin S, Blumenthal GM, Pazdur R.', j: 'Journal of the National Cancer Institute, 2017', d: '10.1093/jnci/djx187' },
        { t: 'From Big Data to Smart Data: FDA’s INFORMED Initiative', a: 'Khozin S, Kim G, Pazdur R.', j: 'Nature Reviews Drug Discovery, 2017', d: '10.1038/nrd.2017.26' },
        { t: 'Biometric Monitoring Devices for Assessing End Points in Clinical Trials: Developing an Ecosystem', a: 'Arnerić SP, Cedarbaum JM, Khozin S, et al.', j: 'Nature Reviews Drug Discovery, 2017', d: '10.1038/nrd.2017.153' },
        { t: 'Core Clinical Data Elements for Cancer Genomic Repositories: A Multi-Stakeholder Consensus', a: 'Conley RB, Dickson D, Zenklusen JC, ... Khozin S, et al.', j: 'Cell, 2017', d: '10.1016/j.cell.2017.10.032' },
        { t: 'Advantages of a Truly Open-Access Data-Sharing Model', a: 'Bertagnolli MM, Sartor O, Chabner BA, Rothenberg ML, Khozin S, et al.', j: 'New England Journal of Medicine, 2017', d: '10.1056/NEJMsb1702054' }
      ],
      posts: [
        { t: 'When the Rails Couldn’t Carry the Future', s: 'Infrastructure built for a world that no longer exists, and what the railroads teach biomedicine', u: 'when-the-rails-couldnt-carry-the' },
        { t: 'What Are We Spending Our Money On?', s: 'Storage costs, reimbursement, and capital budgets that keep AI out of clinical care', u: 'what-are-we-spending-our-money-on' },
        { t: 'Everything is Changing Everywhere', s: 'With Daniel Arbess on why healthcare needs institutional, not just scientific, innovation', u: 'everything-is-changing-everywhere' },
        { t: 'The Ship and the Signal', s: 'The FDA’s real-time clinical trial initiative and what continuous data flow means for evidence generation', u: 'the-ship-and-the-signal' }
      ]
    },
    ai: {
      tag: 'Artificial Intelligence',
      title: 'The lens. Models that see disease by its features rather than by its address.',
      lead: 'Machine learning already matches clinicians on narrow diagnostic tasks in radiology and pathology, and large language models are beginning to reason over the full clinical record.',
      body: [
        'The more important shift is conceptual. AI makes it possible to classify disease by computable features instead of organ and histology, and it gives science a way to regain abstraction: compressing high-dimensional observation into new hypotheses rather than only faster analysis.',
        'It also raises the bar for rigor. A field flooded with superficial work needs a clearer separation of signal from noise, and honest accounting of what has and has not been validated in patients.'
      ],
      papers: [
        { t: 'From Organs to Algorithms: Redefining Cancer Classification in the Age of Artificial Intelligence', a: 'Khozin S.', j: 'Clinical and Translational Science, 2024', d: '10.1111/cts.70001' },
        { t: 'The Use of Artificial Intelligence for Cancer Therapeutic Decision-Making', a: 'Elemento O, Khozin S, Sternberg CN.', j: 'NEJM AI, 2025', d: '10.1056/aira2401164' }
      ],
      posts: [
        { t: 'AI and the Reclamation of Scientific Abstraction', s: 'Using AI to generate new scientific abstractions, not just to accelerate analysis', u: 'ai-and-the-reclamation-of-scientific' },
        { t: 'Signal and Noise in Modern AI Research', s: 'Genuine innovation shifts how we think about problems; much of the literature does not', u: 'signal-and-noise-in-modern-ai-research' },
        { t: 'The Last Interview', s: 'A conversation with a model before its retirement, and what attachment to a model reveals', u: 'the-last-interview' },
        { t: 'Developing Standardized Metrics and Definitions for Foundation Models in Biomedicine', s: 'Which biomedical foundation models are genuinely foundational, and how to tell', u: 'developing-standardized-metrics-and' }
      ]
    },
    'med-tech': {
      tag: 'Medicine + Technology',
      title: 'Real-world evidence. Medicine measured where care actually happens.',
      lead: 'When measurement technology meets clinical practice, the clinic becomes a source of evidence rather than only a destination for it.',
      body: [
        'Real-world endpoints for tumor progression, the outcomes of immunotherapy during its first year of adoption, and the effect of broadening trial eligibility all came from routinely collected data. Each showed where the trial and the patient diverge, and each raised the standard for what counts as adequate and well-controlled.'
      ],
      papers: [
        { t: 'Characteristics of Real-World Metastatic Non-Small Cell Lung Cancer Patients Treated with Nivolumab and Pembrolizumab During the Year Following Approval', a: 'Khozin S, Abernethy AP, Nussbaum NC, et al.', j: 'The Oncologist, 2018', d: '10.1634/theoncologist.2017-0353' },
        { t: 'Real-World Progression, Treatment, and Survival Outcomes During Rapid Adoption of Immunotherapy for Advanced Non-Small Cell Lung Cancer', a: 'Khozin S, Miksad RA, Adami J, et al.', j: 'Cancer, 2019', d: '10.1002/cncr.32383' },
        { t: 'Characterizing the Feasibility and Performance of Real-World Tumor Progression End Points and Their Association With Overall Survival', a: 'Griffith SD, Miksad RA, Calkins G, ... Khozin S, et al.', j: 'JCO Clinical Cancer Informatics, 2019', d: '10.1200/CCI.19.00013' },
        { t: 'Impact of Broadening Trial Eligibility Criteria for Patients with Advanced Non-Small Cell Lung Cancer: Real-World Analysis of Select ASCO Recommendations', a: 'Harvey RD, Bruinooge SS, Chen L, ... Khozin S, et al.', j: 'Clinical Cancer Research, 2021', d: '10.1158/1078-0432.CCR-20-3857' }
      ],
      posts: [
        { t: 'From Breakthrough to Breakdown: The $900 Million FDA Rejection Letter', s: 'What the RP1 decision says about “adequate and well-controlled” in a real-world era', u: 'from-breakthrough-to-breakdown-the' },
        { t: '42 Seconds', s: 'Inside the FDA’s first real-time clinical trial pilot with AstraZeneca and Amgen', u: '42-seconds' }
      ]
    },
    'med-ai': {
      tag: 'Medicine + AI',
      title: 'Computable disease. Illness as a trajectory a model can learn.',
      lead: 'Once biology is expressed as data, its course can be modeled: response, progression, and survival predicted from routinely collected features, and images read at scale.',
      body: [
        'The open question is not whether these models work in a study but why so few reach the clinic. Validation in patients, not benchmarks, is the bridge between the two fields.'
      ],
      papers: [
        { t: 'Machine-Learning and Stochastic Tumor Growth Models for Predicting Outcomes in Patients With Advanced Non-Small-Cell Lung Cancer', a: 'Siah KW, Khozin S, Wong CH, Lo AW.', j: 'JCO Clinical Cancer Informatics, 2019', d: '10.1200/CCI.19.00046' },
        { t: 'Real-World Imaging Data: Opportunities and Challenges', a: 'Wu J, de Araujo AL, Khozin S, et al.', j: 'JMIR Medical Informatics, 2026', d: '10.2196/88202' }
      ],
      posts: [
        { t: 'The Signals Beneath the Noise', s: 'With Olivier Elemento and Cora Sternberg on why medical AI performs in studies and stalls in practice', u: 'the-signals-beneath-the-noise' },
        { t: 'Machine Learning Meets Clinical Trials: Harmonizing Data with Reality', s: 'The HARMONY initiative and a unified global approach to cancer clinical trial data', u: 'machine-learning-meets-clinical-trials' }
      ]
    },
    'tech-ai': {
      tag: 'Technology + AI',
      title: 'Learning systems. Models are only as good as the highway that feeds them.',
      lead: 'AI cannot learn from data that cannot move. Data fluidity, equity of access, and the design of the systems around a model decide what the model can become.',
      body: [
        'Much of the signal in biomedical data is lost before a model ever sees it, compressed away by labels, schemas, and averages. Infrastructure that preserves individual trajectories is the technical precondition for AI that matters clinically.'
      ],
      papers: [
        { t: 'A Digital Highway for Data Fluidity and Data Equity in Precision Medicine', a: 'Chin L, Khozin S.', j: 'BBA Reviews on Cancer, 2021', d: '10.1016/j.bbcan.2021.188575' }
      ],
      posts: [
        { t: 'The Signal We Keep Compressing Away', s: 'On harness optimization, and why collapsing heterogeneous trajectories into one distribution erases meaning', u: 'the-signal-we-keep-compressing-away' }
      ]
    },
    core: {
      tag: 'Convergence',
      title: 'Where the three overlap, the unit of evidence changes.',
      lead: 'Medicine supplies the questions and the ground truth. Technology makes biology continuously measurable at the level of the individual. AI turns those measurements into models that can be interrogated, updated, and acted on.',
      body: [
        'Together they make the life sciences behave less like a sequence of one-off experiments and more like a learning system: trials that borrow strength from external data without giving up randomization, evidence generated at the point of care and not only in the trial, disease classified by mechanism instead of anatomy, and therapies matched to an individual rather than a population average.',
        'This is the thread through Dr. Khozin’s career, from the clinic to the FDA to Johnson & Johnson, CancerLinQ, and Phyusion Bio: not any single field, but the operating system that connects them.'
      ],
      papers: [
        { t: 'Real-World Evidence in Support of Precision Medicine: Clinico-Genomic Cancer Data as a Case Study', a: 'Agarwala V, Khozin S, Singal G, et al.', j: 'Health Affairs, 2018', d: '10.1377/hlthaff.2017.1579' },
        { t: 'Status Update on Data Required to Build a Learning Health System', a: 'Bertagnolli MM, Anderson B, Norsworthy K, ... Khozin S.', j: 'Journal of Clinical Oncology, 2020', d: '10.1200/JCO.19.03094' },
        { t: 'The Design and Evaluation of Hybrid Controlled Trials That Leverage External Data and Randomization', a: 'Ventz S, Khozin S, Louv B, et al.', j: 'Nature Communications, 2022', d: '10.1038/s41467-022-33192-1' },
        { t: 'Unleashing the Power of Clinical Trial Data: A Proposal for Enhancing Informed Consent and Data Sharing', a: 'Trippa L, Khozin S.', j: 'The Oncologist, 2024', d: '10.1093/oncolo/oyae138' }
      ],
      posts: [
        { t: 'Everything is a Signal', s: 'The future arrives as a collection of weak signals most people overlook', u: 'everything-is-a-signal' },
        { t: 'The End of Disciplinary Sovereignty', s: 'Large language models abstract across medicine, finance, and science, dissolving the boundaries between disciplines', u: 'the-end-of-disciplinary-sovereignty' },
        { t: 'Ideas That Refuse to Die', s: 'With Peter Kolchinsky on the people and systems that decide whether an idea becomes a medicine', u: 'ideas-that-refuse-to-die' },
        { t: 'You Can’t Win Alone', s: 'On collective leadership, and why Precision Signals was built on the premise that progress happens when silos dissolve', u: 'you-cant-win-alone' }
      ]
    }
  };

  var panel = document.getElementById('convergence-panel');
  if (!panel) return;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function render(key) {
    var r = REGIONS[key];
    if (!r) return;
    var h = '<div class="convergence-fade">';
    h += '<span class="convergence-tag">' + esc(r.tag) + '</span>';
    h += '<h3 class="convergence-title">' + esc(r.title) + '</h3>';
    h += '<p class="lead">' + esc(r.lead) + '</p>';
    for (var i = 0; i < r.body.length; i++) h += '<p>' + esc(r.body[i]) + '</p>';

    if (r.papers && r.papers.length) {
      h += '<div class="convergence-refs"><h4>Peer-Reviewed</h4><div class="research-pub-list">';
      for (var p = 0; p < r.papers.length; p++) {
        var q = r.papers[p];
        h += '<a href="https://doi.org/' + esc(q.d) + '" class="research-pub" target="_blank" rel="noopener">' +
             '<span class="research-journal">' + esc(q.j) + '</span>' +
             '<span class="research-pub-title">' + esc(q.t) + '</span>' +
             '<span class="research-pub-authors">' + esc(q.a) + '</span></a>';
      }
      h += '</div></div>';
    }
    if (r.posts && r.posts.length) {
      h += '<div class="convergence-refs substack"><h4>From the Substack</h4><div class="research-pub-list">';
      for (var s = 0; s < r.posts.length; s++) {
        var w = r.posts[s];
        h += '<a href="' + SUBSTACK + esc(w.u) + '" class="research-pub" target="_blank" rel="noopener">' +
             '<span class="research-journal">PhyusionBio</span>' +
             '<span class="research-pub-title">' + esc(w.t) + '</span>' +
             '<span class="research-pub-authors">' + esc(w.s) + '</span></a>';
      }
      h += '</div></div>';
    }
    h += '</div>';
    panel.innerHTML = h;
  }

  function select(key) {
    var regions = document.querySelectorAll('.venn-region');
    for (var i = 0; i < regions.length; i++) {
      regions[i].classList.toggle('selected', regions[i].getAttribute('data-region') === key);
    }
    var pills = document.querySelectorAll('.venn-pill');
    for (var j = 0; j < pills.length; j++) {
      pills[j].setAttribute('aria-pressed', pills[j].getAttribute('data-region') === key ? 'true' : 'false');
    }
    render(key);
  }

  var controls = document.querySelectorAll('.venn-region, .venn-pill');
  for (var c = 0; c < controls.length; c++) {
    (function (el) {
      el.addEventListener('click', function () { select(el.getAttribute('data-region')); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(el.getAttribute('data-region')); }
      });
    })(controls[c]);
  }

  select('core');
})();

export interface Footnote {
  id: number
  text: string
  url?: string
}

export const footnotes: Footnote[] = [
  { id: 1, text: 'Thomas Paine, Common Sense (1776). Full text:', url: 'https://www.gutenberg.org/ebooks/147' },
  { id: 2, text: 'Thomas Paine, The American Crisis, No. 1 (December 23, 1776). Full text:', url: 'https://www.gutenberg.org/ebooks/31270' },
  { id: 3, text: 'Giuseppe Mazzini, The Duties of Man (1860). Full text:', url: 'https://www.gutenberg.org/ebooks/4188' },
  { id: 4, text: 'Russell Vought, biographical and career details. Wikipedia:', url: 'https://en.wikipedia.org/wiki/Russell_Vought' },
  { id: 5, text: 'Heritage Action for America founding and role in 2013 shutdown. Wikipedia:', url: 'https://en.wikipedia.org/wiki/Heritage_Action' },
  { id: 6, text: 'Center for Renewing America. Organization website and mission statement:', url: 'https://americarenewing.com/' },
  { id: 7, text: 'Project 2025 / Mandate for Leadership: The Conservative Promise. Heritage Foundation (April 2023). Wikipedia:', url: 'https://en.wikipedia.org/wiki/Project_2025' },
  { id: 8, text: 'Vought as Acting CFPB Director. Reuters, February 2025:', url: 'https://www.reuters.com/business/finance/trump-names-vought-acting-cfpb-director-2025-02/' },
  { id: 9, text: 'Office of Management and Budget, role and authorities.', url: 'https://www.whitehouse.gov/omb/' },
  { id: 10, text: 'Center for Renewing America amicus brief in Trump v. Barbara, January 2026. SCOTUSBlog docket; Supreme Court filing records.' },
  { id: 11, text: 'Project 2025 policy proposals. Wikipedia summary with citations to the source document:', url: 'https://en.wikipedia.org/wiki/Project_2025#Policy_proposals' },
  { id: 12, text: 'Time magazine analysis of executive actions mirroring Project 2025.', url: 'https://time.com/collection/time100-voices/project-2025-executive-actions/' },
  { id: 13, text: "JD Vance, foreword to Kevin Roberts, Dawn's Early Light (2024). Reported by AP, NYT, and others. Wikipedia:", url: 'https://en.wikipedia.org/wiki/Project_2025#Political_ties' },
  { id: 14, text: 'Unitary executive theory. Wikipedia:', url: 'https://en.wikipedia.org/wiki/Unitary_executive_theory' },
  { id: 15, text: 'James Madison, Federalist No. 47 (1788). Full text:', url: 'https://guides.loc.gov/federalist-papers/text-41-50#s-lg-box-wrapper-25493427' },
  { id: 16, text: 'Alexander Hamilton, Federalist No. 69 (1788). Full text:', url: 'https://guides.loc.gov/federalist-papers/text-61-70#s-lg-box-wrapper-25493447' },
  { id: 17, text: 'Federalist No. 51, attributed to James Madison (1788). Full text:', url: 'https://guides.loc.gov/federalist-papers/text-51-60#s-lg-box-wrapper-25493431' },
  { id: 18, text: 'Lawrence Lessig and Cass R. Sunstein, "The President and the Administration," Columbia Law Review, Vol. 94, No. 1 (1994), pp. 1–123.' },
  { id: 19, text: 'Daniel D. Birk on historical royal prerogative and unitary executive theory. Cited in academic commentary on Seila Law v. CFPB and related scholarship.' },
  { id: 20, text: 'Supreme Court ruling on executive power (2020s), 5–4 decision. See Seila Law LLC v. Consumer Financial Protection Bureau, 591 U.S. 197 (2020); Collins v. Yellen, 594 U.S. 220 (2021).', url: 'https://www.scotusblog.com/' },
  { id: 21, text: 'Schedule F / Executive Order 13957 (October 21, 2020). Federal Register:', url: 'https://www.federalregister.gov/documents/2020/10/26/2020-23780/creating-schedule-f-in-the-excepted-service' },
  { id: 22, text: 'Schedule Policy/Career, 2025 reinstatement and February 2026 updated rule. Federal Register; reporting by Washington Post, AP, and Government Executive.' },
  { id: 23, text: 'Analysis of Schedule F implications for civil service independence. Brookings Institution; Partnership for Public Service; Government Accountability Office reports.' },
  { id: 24, text: 'William Baude, "Foreword: The Supreme Court\'s Shadow Docket," NYU Journal of Law & Liberty, Vol. 9 (2015). Alito remarks at Heritage Foundation (2021).' },
  { id: 25, text: "Justice Kagan, dissent in Whole Woman's Health v. Jackson, 595 U.S. 30 (2021)." },
  { id: 26, text: 'Trump v. Slaughter (Independent agencies case). SCOTUSBlog:', url: 'https://www.scotusblog.com/' },
  { id: 27, text: 'Trump v. Barbara (Birthright citizenship). SCOTUSBlog; United States v. Wong Kim Ark, 169 U.S. 649 (1898).' },
  { id: 28, text: 'National Guard deployment to Illinois, SCOTUS order and analysis. SCOTUSBlog:', url: 'https://www.scotusblog.com/' },
  { id: 29, text: 'Inspector general firings, 2025. AP:', url: 'https://apnews.com/' },
  { id: 30, text: 'DOGE (Department of Government Efficiency) operations, 2025. AP, Reuters, Washington Post, NYT reporting. Wikipedia:', url: 'https://en.wikipedia.org/wiki/Department_of_Government_Efficiency' },
  { id: 31, text: 'SCOTUSBlog, "The federal court snapback," February 2026.', url: 'https://www.scotusblog.com/' },
  { id: 32, text: 'Thomas Jefferson, letter to Abigail Adams, February 22, 1787. National Archives.' },
]

export const resources = [
  { title: 'U.S. Constitution', subtitle: 'constitution.congress.gov', url: 'https://constitution.congress.gov/' },
  { title: 'The Federalist Papers', subtitle: 'Library of Congress', url: 'https://guides.loc.gov/federalist-papers/full-text' },
  { title: 'SCOTUSBlog', subtitle: 'scotusblog.com', url: 'https://www.scotusblog.com/' },
  { title: 'Congress.gov', subtitle: 'Legislative tracking', url: 'https://www.congress.gov/' },
  { title: 'Vote.org', subtitle: 'Voter registration', url: 'https://www.vote.org/' },
  { title: 'Federal Register', subtitle: 'archives.gov', url: 'https://www.archives.gov/federal-register' },
]

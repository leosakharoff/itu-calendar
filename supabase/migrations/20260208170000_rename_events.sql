-- Rename Software Architecture events to use L<Number> and D<Number> format

-- Lectures
UPDATE events SET title = 'L1: Introduction & architectural attributes' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%Introduction%';
UPDATE events SET title = 'L2: Architectural description' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%description%';
UPDATE events SET title = 'L3: Architectural synthesis' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%synthesis%' AND type = 'lecture';
UPDATE events SET title = 'L4: Detailed design' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%Detailed design%';
UPDATE events SET title = 'L5: Architectural prototyping' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%prototyping%' AND type = 'lecture';
UPDATE events SET title = 'L6: Agile architecture' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%Agile%';
UPDATE events SET title = 'L7: Architectural evaluation' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%evaluation%' AND type = 'lecture';
UPDATE events SET title = 'L8: Software ecosystems' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%ecosystems%';
UPDATE events SET title = 'L9: Guest lecture' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%Guest%';
UPDATE events SET title = 'L10: Architectural reconstruction (1)' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%reconstruction (1)%';
UPDATE events SET title = 'L11: Architectural reconstruction (2)' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%reconstruction (2)%';
UPDATE events SET title = 'L12: Architectural reconstruction (3)' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%reconstruction (3)%';
UPDATE events SET title = 'L13: Architectural reconstruction (4)' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%reconstruction (4)%';
UPDATE events SET title = 'L14: Legacy systems & Ethics' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%Legacy%';

-- Deliverables
UPDATE events SET title = 'D0: Project groups' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%Project groups%';
UPDATE events SET title = 'D1: Analysis' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%Analysis%' AND type = 'deliverable';
UPDATE events SET title = 'D2: Synthesis' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%Synthesis%' AND type = 'deliverable';
UPDATE events SET title = 'D3: Prototyping' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%Prototyping%' AND type = 'deliverable';
UPDATE events SET title = 'D4: Architectural Evaluation' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%Evaluation%' AND type = 'deliverable';
UPDATE events SET title = 'D6: Architecture Recovery' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%Recovery%' AND type = 'deliverable';
UPDATE events SET title = 'D7: Report Submission' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%Report%' AND type = 'deliverable';

-- Reviews (keep as R<Number>)
UPDATE events SET title = 'R1: Analysis review' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%Review deliverable 1%';
UPDATE events SET title = 'R2: Synthesis review' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%Review deliverable 2%';
UPDATE events SET title = 'R3: Prototyping review' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%Review deliverable 3%';
UPDATE events SET title = 'R4: Evaluation review' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%Review deliverable 4%';
UPDATE events SET title = 'R6: Recovery review' WHERE course_id = 'eeeb2ca3-44e0-4d1f-b212-19ea53d1b126' AND title LIKE '%Review Architecture%';

-- DevOps lectures
UPDATE events SET title = 'L1' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Lecture 1';
UPDATE events SET title = 'L2' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Lecture 2';
UPDATE events SET title = 'L3' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Lecture 3';
UPDATE events SET title = 'L4' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Lecture 4';
UPDATE events SET title = 'L5' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Lecture 5';
UPDATE events SET title = 'L6' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Lecture 6';
UPDATE events SET title = 'L7' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Lecture 7';
UPDATE events SET title = 'L8' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Lecture 8';
UPDATE events SET title = 'L9' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Lecture 9';
UPDATE events SET title = 'L10' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Lecture 10';
UPDATE events SET title = 'L11' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Lecture 11';
UPDATE events SET title = 'L12' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Lecture 12';
UPDATE events SET title = 'L13' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Lecture 13';
UPDATE events SET title = 'L14' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Lecture 14';

-- DevOps deliverables
UPDATE events SET title = 'D1' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Weekly 1 DUE';
UPDATE events SET title = 'D2' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Weekly 2 DUE';
UPDATE events SET title = 'D3' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Weekly 3 DUE';
UPDATE events SET title = 'D4' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Weekly 4 DUE';
UPDATE events SET title = 'D5' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Weekly 5 DUE';
UPDATE events SET title = 'D6' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Weekly 6 DUE';
UPDATE events SET title = 'D7' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Weekly 7 DUE';
UPDATE events SET title = 'D8' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Weekly 8 DUE';
UPDATE events SET title = 'D9' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Weekly 9 DUE';
UPDATE events SET title = 'D10' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Weekly 10 DUE';
UPDATE events SET title = 'D11' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Weekly 11 DUE';
UPDATE events SET title = 'D12' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Weekly 12 DUE';
UPDATE events SET title = 'D13' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Weekly 13 DUE';
UPDATE events SET title = 'D14' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Weekly 14 DUE';
UPDATE events SET title = 'D15: Report' WHERE course_id = 'e69384b2-80de-4e94-96de-cc176c21ecc5' AND title = 'Report DUE';

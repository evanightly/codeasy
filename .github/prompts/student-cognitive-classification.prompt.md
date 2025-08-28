# Student Cognitive Classification

## Roles
- Administrator: trigger the classification process
- Teacher and Student: view the classification result

## Process
1. Accumulate all student data in a single course
2. Get all course [learning material](laravel/app/Models/LearningMaterial.php)

3. Each [learning material](laravel/app/Models/LearningMaterial.php) has [questions](laravel/app/Models/LearningMaterialQuestion.php) and those questions are answered by the student
4. The answer is a [ExecutionResult](laravel/app/Models/ExecutionResult.php), which has multiple records
5. You basically need 2 model that holds different data
   - [StudentScore](laravel/app/Models/StudentScore.php)
    - completion_status: benefit
    - trial_status: benefit
    - compile_count: cost
   - [ExecutionResult](laravel/app/Models/ExecutionResult.php)
    - variable_count: benefit
    - function_count: benefit

    NOTE: we use StudentScore model with property of completed_execution_result_id to determine which execution result will be used
6. Those data will be served as 2 2D tables
    - Left table header label is the learning material name with its ordered number
    - Top table header label is the question name with its ordered number
    - Each of those top table header will have a list of properties that defined in the number 5

    Table Example

    ```
    Empty	1 Test Question				2 Test Question				3 Test Question				4 Test Question				5 Test Question				6 Test Question			
    Material	compile	waktu	selesai	coba	compile	waktu	selesai	coba	compile	waktu	selesai	coba	compile	waktu	selesai	coba	compile	waktu	selesai	coba	compile	waktu	selesai	coba
    1 M. Name	10	23	1	1	39	31	1	0	49	30	0	0	10	32	1	1	44	37	0	0	13	28	0	0
    2 M. Name	45	30	1	1	39	24	1	1	34	35	1	0	13	45	1	1	16	33	1	1	26	12	1	1
    3 M. Name	43	47	1	1	15	15	1	1	16	44	1	1	48	13	1	1	12	21	1	1	42	34	1	1
    4 M. Name	28	33	1	1	30	46	1	1	28	32	1	1	20	26	1	1	45	23	1	1	22	46	1	1
    5 M. Name	22	28	1	1	24	10	1	1	19	29	1	1	20	15	1	1	27	17	1	1	29	29	1	1
    6 M. Name	16	25	1	1	44	33	1	1	19	39	1	1	34	13	1	1	32	31	1	1	14	48	1	1
    7 M. Name	38	17	1	1	15	22	1	1	17	44	1	1	48	14	1	1	36	50	1	1	35	38	1	1
    8 M. Name	46	22	1	1	24	47	1	1	14	39	1	1	29	43	1	1	25	41	1	1	16	42	1	1
    9 M. Name	34	48	1	1	48	20	1	1	34	27	1	1	39	22	1	1	19	24	1	1	12	50	1	1
    ```

7. If the student has still not finished the question, they will have a 0 value for those properties

8. The cognitive classification will be calculated using TOPSIS method

9. Waktu is time using minutes instead of seconds (which is stored in database)

10. After the TOPSIS method is calculated, the result will be mapped to rule base

```
Rule Base		
CC >= 0.85		Create
0.70 <= CC < 0.85		Evaluate
0.55 <= CC < 0.70		Analyze
0.40 <= CC < 0.55		Apply
0.25 <= CC < 0.40		Understand
CC < 0.25		Remember
```

11. Those final result will be recorded and attached to the respective [student](laravel/app/Models/User.php)

12. The student cognitive results are one to many based, it will be used in the student charts. Each result will provide insights into the student's performance over time.

13. You have to utilize the [fastapi server](fastapi/main.py) to do the classification process, so the laravel only needs to call the fastapi server and get the result

## Sidenotes
1. When the [test case](laravel/app/Models/LearningMaterialQuestionTestCase.php) that has been done by the student is not the same as the one that is in the database (dirty), the cognitive classification will be reiterated to maintain the accuracy of the test case with the student's answer.

## Revision 1
1. Changed raw data that needs to be processed

Narrowed down from complete all material with its questions to only one material with its questions

Raw tabular data changed from

Represent course complete materials with its questions

|           | Question 1 | Question 1 | Question 1 | Question 1 | Question 1   | Question 1   | Question 2 | Question 2 | Question 2 | Question 2 | Question 2   | Question 2   | Question 3 | Question 3 | Question 3 | Question 3 | Question 3   | Question 3   | Question 4 | Question 4 | Question 4 | Question 4 | Question 4   | Question 4   | Question 5 | Question 5 | Question 5 | Question 5 | Question 5   | Question 5   | Question 6 | Question 6 | Question 6 | Question 6 | Question 6   | Question 6   |
| --------- | ---------- | ---------- | ---------- | ---------- | ------------ | ------------ | ---------- | ---------- | ---------- | ---------- | ------------ | ------------ | ---------- | ---------- | ---------- | ---------- | ------------ | ------------ | ---------- | ---------- | ---------- | ---------- | ------------ | ------------ | ---------- | ---------- | ---------- | ---------- | ------------ | ------------ | ---------- | ---------- | ---------- | ---------- | ------------ | ------------ |
| materials | compile_q1 | waktu_q1   | selesai_q1 | coba_q1    | variables_q1 | functions_q1 | compile_q2 | waktu_q2   | selesai_q2 | coba_q2    | variables_q2 | functions_q2 | compile_q3 | waktu_q3   | selesai_q3 | coba_q3    | variables_q3 | functions_q3 | compile_q4 | waktu_q4   | selesai_q4 | coba_q4    | variables_q4 | functions_q4 | compile_q5 | waktu_q5   | selesai_q5 | coba_q5    | variables_q5 | functions_q5 | compile_q6 | waktu_q6   | selesai_q6 | coba_q6    | variables_q6 | functions_q6 |
| 1         | 3          | 4.3        | 1          | 1          | 5            | 2            | 3          | 3.95       | 1          | 1          | 4            | 2            | 4          | 4.63       | 1          | 1          | 5            | 1            | 3          | 4.12       | 1          | 1          | 4            | 1            | 2          | 3.78       | 1          | 1          | 3            | 1            | 0          | 0          | 0          | 0          | 0            | 0            |
| 2         | 3          | 4.72       | 1          | 1          | 5            | 2            | 3          | 4.35       | 1          | 1          | 4            | 2            | 5          | 5.1        | 1          | 1          | 5            | 1            | 3          | 4.53       | 1          | 1          | 4            | 1            | 2          | 4.15       | 0          | 1          | 4            | 1            | 0          | 0          | 0          | 0          | 0            | 0            |
| 3         | 4          | 5.15       | 1          | 1          | 5            | 2            | 4          | 3.67       | 1          | 1          | 4            | 2            | 5          | 5.57       | 1          | 1          | 5            | 1            | 4          | 4.95       | 1          | 1          | 4            | 1            | 5          | 3.83       | 1          | 1          | 4            | 1            | 0          | 0          | 0          | 0          | 0            | 0            |

To

Represent material questions

| questions | compile_q1 | waktu_q1 | selesai_q1 | coba_q1 |
| --------- | ---------- | -------- | ---------- | ------- |
| 1         | 3          | 4.3      | 1          | 1       |
| 2         | 5          | 2        | 3          | 3.95    |
| 3         | 1          | 1        | 4          | 2       |
| 4         | 4          | 4.63     | 1          | 1       |
| 5         | 5          | 1        | 3          | 4.12    |

2. The classification result will be stored in each of student score that hold each material data
3. Each material will return final cc score and the classification result
4. The grand final classification result will be placed in the student_course_cognitive_classification table (table name is still subject to change), the calculation will be based on the average of all material classification result and will be mapped to the rule base
5. This system is expected to show recommendation for the student to improve their cognitive level for each of materials, the recommendation will be based on the classification calculation mechanism, the recommendation may be vary, for example:
    - If the student defined "less" variable_count in specific question of the material, the recommendation will be "You need to define more variables in this question"
    - If the student defined "less" function_count in specific question of the material, the recommendation will be "You need to define more functions in this question"
    - If the student have "less" completed question in specific material, the recommendation will be "You need to complete more questions in this material"
    - If the student spent "more" time in specific question of the material, the recommendation will be "You could spend less time in this question to improve your score"
    - If the student have "more" compile_count in specific question of the material, the recommendation will be "You could improve your score by reducing the compile count in this question"

## Revision 2
1. Add more properties in the [StudentScore](laravel/app/Models/StudentScore.php):
    - test_case_complete_count to hold the completed test case count
    - test_case_total_count to hold the total test case count

    Note: since this is breaking changes, you need to adjust the affected service files, like student code compilation and student cognitive calculation, you have to work on the [ExecutionResultService](laravel/app/Services/ExecutionResultService.php) or related services process such as classification calculation in [StudentCognitiveClassificationService](laravel/app/Services/StudentCognitiveClassificationService.php) 
2. Add history table to hold the classification result [student_course_cognitive_classification_histories](laravel/database/migrations/2025_05_20_134237_create_student_course_cognitive_classification_histories_table.php)
    This table will hold the history of the classification result, so you can track the changes over time, you may adjust it if the mechanism is not suitable for your needs

## Revision 3
### Brief
There will be new classification calculation, the breaking changes will be like this:
1. each test case has its own cognitive levels, the cognitive level would be level 1 - 6, each level represent bloom taxonomy level
2. cognitive level in each test case will be different and based on the specific learning objectives of the test case, it could be one or more than one cognitive level, for example:
`self.assertIn("read_csv", student_code)` 
the code above has C1, and C2, the explanation is as follows:
C1: Remembering - The student needs to remember the syntax of the `read_csv` function.
C2: Understanding - The student needs to understand how the `read_csv` function works and what it does.
3. If the student passed those test case, the student will automatically hold cognitive level that defined in the respective test case
4. The classification process in each student is explained below:
- Material Level:
each material will be calculated based on the average cognitive level of all test cases in that material
- Course Level:
each material will be calculated based on the average cognitive level of all materials in that course

### Study Case
Student: A
Modul: Introduction
Cognitive Level | Achieved Cognitive Level | Total Cognitive Level in Material | Average
C1 | 1 | 5 | 0.2
C2 | 5 | 10 | 0.5
C3 | 5 | 10 | 0.5
C4 | 2 | 8 | 0.25
C5 | 1 | 5 | 0.2
C6 | 0 | 3 | 0.0

Final Result in a material: C3 (Apply), Average: 0.5 (Highest rate and highest cognitive level)

### Implementation Steps
1. update LearningMaterialQuestionTestCase and learning_material_question_test_cases migration to include cognitive_levels as a json ✔️
2. update execution_results to store the achieved test case ids as a json ✔️
3. update edit form for LearningMaterialQuestionTestCase and learning_material_question_test_cases to support cognitive_levels, tips: you can use C1 - C6 as a checkbox ✔️
4. (crucial) add a page to bulk changes all test case in a course ✔️
5. when the admin execute classification, the system will ask whether use cognitive level test case based or the one that defined (✔️ using dropdown), note: this process is crucial, after that the process is explained below
    5A. (Student code cognitive level syncronization). Student test assertion, this is to define which test case is achieved by student ✔️:
        5a1. Get each student final score, you can search it within StudentScore completed_execution_result_id, after that you can look up the execution_id and get the execution result, TLDR: to get the student code, get it by StudentScore->completed_execution_result, those execution result is the student code that you should be focused
        5a2. After you get the execution result, perform test assertion in those code to get which test case is completed, the process is the same as in the main.py @app.post("/test")
        5a3. After that, you will get which test case id that student completed, in @app.post("/test") it will return passed_test_case_ids, update the respective execution result and put that in the execution_result under achieved_test_case_ids column you created in the number 2
        5a4. The button will be located before run classification button in page student-cognitive-classifications
    5B. Student cognitive level calculation, this is to define the course cognitive_level and material cognitive_level:
        5b1. Get the cognitive level of each test case from the LearningMaterialQuestionTestCase model in each materials, tips: in LearningMaterial, i've defined countCognitiveLevels method to help easen your pain.
        5b2. Map the achieved test case ids from each student execution result, and count which cognitive levels are achieved by the student and adding average and the highest cognitive_level achieved by total cognitive_levels that material has, the study case example is in the picture .github/prompts/case_study.jpg
        5b3. To get the course classification result, use the average and the highest cognitive level of all materials in that course
        5b4. Just like topsis classification does, do record all classification steps so the user will know how to interpret the results, and it will show perfectly in the StudentCourseCognitiveClassificationDetails.tsx
        5b5. Store complete calculation in the student_course_cognitive_classification_histories from student, student code, test case, until final course classification result
    Note: this process may take long time, make sure to make a progress tracker feature/loading progress indicator that use websocket, we already integrate the system with laravel reverb and provide you example within TestEvent.php, and to listen it use `useEcho(
        `test-channel`,
        'TestEvent',
        (e) => {
            console.log(e);
        },
        [],
        'public',
    );` 
6. update the classification logic to accommodate the new cognitive_levels structure
7. About the detail page in each students:
7a. (Material Level) MaterialClassifications.tsx and ClassificationDetails.tsx need to adjust:
    - Material information (title, ID, etc.)
    - Cognitive levels for each test case in the material
    - Achieved cognitive levels for each test case in the material
    - Overall cognitive level for the material
    - History of cognitive classification steps for the material
7b. (Course Level) StudentCourseCognitiveClassificationDetails.tsx need to adjust:
    - Student information (name, ID, etc.)
    - Course information (title, ID, etc.)
    - Material classifications with their cognitive levels
    - Overall cognitive level for the course
    - History of cognitive classification steps

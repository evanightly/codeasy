# Student Cognitive Classification

## Process
1. Accumulate all student data in a single course
2. Get all course [learning material](../../laravel/app/Models/LearningMaterial.php)
3. Each [learning material](../../laravel/app/Models/LearningMaterial.php) has [questions](../../laravel/app/Models/LearningMaterialQuestion.php) and those questions are answered by the student
4. The answer is a [ExecutionResult](../../laravel/app/Models/ExecutionResult.php), which has multiple records
5. You basically need 2 model that holds different data
   - [StudentScore](../../laravel/app/Models/StudentScore.php)
    - completion_status: benefit
    - trial_status: cost
    - compile_count: cost
   - [ExecutionResult](../../laravel/app/Models/ExecutionResult.php)
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

9. After the TOPSIS method is calculated, the result will be mapped to rule base

```
Rule Base		
CC >= 0.85		Create
0.70 <= CC < 0.85		Evaluate
0.55 <= CC < 0.70		Analyze
0.40 <= CC < 0.55		Apply
0.25 <= CC < 0.40		Understand
CC < 0.25		Remember
```

10. Those final result will be recorded and attached to the respective [student](../../laravel/app/Models/User.php)

11. The student cognitive results are one to many based, it will be used in the student charts. Each result will provide insights into the student's performance over time.

12. You can utilize the [fastapi server](../../fastapi/main.py) to do the process, so the laravel only needs to call the fastapi server and get the result

## Sidenotes
1. When the [test case](../../laravel/app/Models/LearningMaterialQuestionTestCase.php) that has been done by the student is not the same as the one that is in the database (dirty), the cognitive classification will be reiterated to maintain the accuracy of the test case with the student's answer.
2. There will be adjustment to the student score to select the first completed execution result
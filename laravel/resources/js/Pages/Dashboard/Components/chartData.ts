import { ChartConfig } from '@/Components/UI/chart';

// Admin chart data
export const adminBarData = [
    { month: 'January', users: 150 },
    { month: 'February', users: 245 },
    { month: 'March', users: 310 },
    { month: 'April', users: 380 },
    { month: 'May', users: 430 },
    { month: 'June', users: 512 },
];

export const adminPieData = [
    { role: 'Siswa', count: 400, fill: 'hsl(var(--chart-1))' },
    { role: 'Guru', count: 30, fill: 'hsl(var(--chart-2))' },
    { role: 'Admin', count: 5, fill: 'hsl(var(--chart-3))' },
];

export const adminLineData = [
    { day: 1, visits: 30 },
    { day: 2, visits: 80 },
    { day: 3, visits: 120 },
    { day: 4, visits: 100 },
    { day: 5, visits: 140 },
    { day: 6, visits: 200 },
    { day: 7, visits: 220 },
];

export const adminRadarData = [
    { dimension: 'Traffic', january: 70, june: 95 },
    { dimension: 'Registrations', january: 55, june: 75 },
    { dimension: 'Active Users', january: 60, june: 90 },
    { dimension: 'Feedback', january: 30, june: 55 },
    { dimension: 'Completed Modules', january: 40, june: 80 },
];

export const adminConfig: ChartConfig = {
    users: {
        label: 'Users',
        color: 'hsl(var(--chart-1))',
    },
    role: {
        label: 'Role',
    },
    visits: {
        label: 'Visits',
        color: 'hsl(var(--chart-1))',
    },
    january: {
        label: 'January',
        color: 'hsl(var(--chart-3))',
    },
    june: {
        label: 'June',
        color: 'hsl(var(--chart-2))',
    },
};

// Teacher chart data
export const teacherBarData = [
    { kelas: 'Kelas A', averageScore: 78 },
    { kelas: 'Kelas B', averageScore: 82 },
    { kelas: 'Kelas C', averageScore: 90 },
    { kelas: 'Kelas D', averageScore: 60 },
];

export const teacherPieData = [
    { label: 'Completed', value: 65, fill: 'hsl(var(--chart-1))' },
    { label: 'On Progress', value: 25, fill: 'hsl(var(--chart-2))' },
    { label: 'Not Attempted', value: 10, fill: 'hsl(var(--chart-3))' },
];

export const teacherRadarData = [
    { module: 'Data Wrangling', max: 100, score: 75 },
    { module: 'Vis. Dasar', max: 100, score: 80 },
    { module: 'ML Dasar', max: 100, score: 65 },
    { module: 'Python Basic', max: 100, score: 90 },
    { module: 'Pandas/NumPy', max: 100, score: 85 },
];

export const teacherRadialData = [
    { name: 'Top Siswa A', progress: 90, fill: 'hsl(var(--chart-1))' },
    { name: 'Top Siswa B', progress: 85, fill: 'hsl(var(--chart-2))' },
    { name: 'Top Siswa C', progress: 80, fill: 'hsl(var(--chart-3))' },
    { name: 'Top Siswa D', progress: 78, fill: 'hsl(var(--chart-4))' },
    { name: 'Top Siswa E', progress: 75, fill: 'hsl(var(--chart-5))' },
];

export const teacherConfig: ChartConfig = {
    averageScore: {
        label: 'Average Score',
        color: 'hsl(var(--chart-1))',
    },
    value: {
        label: 'Module Completion',
    },
    score: {
        label: 'Score',
        color: 'hsl(var(--chart-2))',
    },
    progress: {
        label: 'Progress',
        color: 'hsl(var(--chart-3))',
    },
};

// Student chart data
export const studentAreaData = [
    { date: '2025-01-01', progress: 10 },
    { date: '2025-01-05', progress: 20 },
    { date: '2025-01-10', progress: 40 },
    { date: '2025-01-15', progress: 65 },
    { date: '2025-01-20', progress: 75 },
    { date: '2025-01-25', progress: 80 },
    { date: '2025-01-30', progress: 95 },
];

export const studentPieData = [
    { level: 'Remember', value: 4, fill: 'hsl(var(--chart-1))' },
    { level: 'Understand', value: 5, fill: 'hsl(var(--chart-2))' },
    { level: 'Apply', value: 2, fill: 'hsl(var(--chart-3))' },
    { level: 'Analyze', value: 3, fill: 'hsl(var(--chart-4))' },
    { level: 'Evaluate', value: 1, fill: 'hsl(var(--chart-5))' },
    { level: 'Create', value: 0, fill: 'hsl(var(--chart-6))' },
];

export const studentBarData = [
    { modul: 'Intro Data Science', done: 1 },
    { modul: 'Python Basic', done: 1 },
    { modul: 'Pandas/NumPy', done: 0 },
    { modul: 'Matplotlib', done: 0 },
    { modul: 'ML Dasar', done: 0 },
];

export const studentConfig: ChartConfig = {
    progress: {
        label: 'Progress',
        color: 'hsl(var(--chart-1))',
    },
    level: {
        label: 'Bloom Level',
    },
    done: {
        label: 'Done?',
    },
};

// School Admin chart data
export const schoolBarData = [
    { name: 'Guru', count: 23 },
    { name: 'Siswa', count: 560 },
    { name: 'Staff', count: 10 },
];

export const schoolPieData = [
    { name: 'Labs/Computers', value: 12, fill: 'hsl(var(--chart-1))' },
    { name: 'Whiteboards', value: 20, fill: 'hsl(var(--chart-2))' },
    { name: 'Projectors', value: 10, fill: 'hsl(var(--chart-3))' },
    { name: 'Others', value: 5, fill: 'hsl(var(--chart-4))' },
];

export const schoolRadarData = [
    { dimension: 'Kelas A', january: 20, june: 25 },
    { dimension: 'Kelas B', january: 22, june: 30 },
    { dimension: 'Kelas C', january: 27, june: 36 },
    { dimension: 'Kelas D', january: 15, june: 20 },
    { dimension: 'Kelas E', january: 10, june: 18 },
];

export const schoolRadialData = [
    { name: 'Nilai Rata SD', performance: 70, fill: 'hsl(var(--chart-1))' },
    { name: 'Nilai Rata SMP', performance: 85, fill: 'hsl(var(--chart-2))' },
    { name: 'Nilai Rata SMA', performance: 90, fill: 'hsl(var(--chart-3))' },
];

export const schoolConfig: ChartConfig = {
    count: {
        label: 'Count',
        color: 'hsl(var(--chart-1))',
    },
    value: {
        label: 'Value',
        color: 'hsl(var(--chart-2))',
    },
    january: {
        label: 'January',
        color: 'hsl(var(--chart-3))',
    },
    june: {
        label: 'June',
        color: 'hsl(var(--chart-4))',
    },
    performance: {
        label: 'Performance',
        color: 'hsl(var(--chart-2))',
    },
};

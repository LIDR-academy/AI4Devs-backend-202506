"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interview = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class Interview {
    constructor(data) {
        this.id = data.id;
        this.applicationId = data.applicationId;
        this.interviewStepId = data.interviewStepId;
        this.employeeId = data.employeeId;
        this.interviewDate = new Date(data.interviewDate);
        this.result = data.result;
        this.score = data.score;
        this.notes = data.notes;
    }
    async save() {
        const interviewData = {
            applicationId: this.applicationId,
            interviewStepId: this.interviewStepId,
            employeeId: this.employeeId,
            interviewDate: this.interviewDate,
            result: this.result,
            score: this.score,
            notes: this.notes,
        };
        if (this.id) {
            return await prisma.interview.update({
                where: { id: this.id },
                data: interviewData,
            });
        }
        else {
            return await prisma.interview.create({
                data: interviewData,
            });
        }
    }
    static async findOne(id) {
        const data = await prisma.interview.findUnique({
            where: { id: id },
        });
        if (!data)
            return null;
        return new Interview(data);
    }
}
exports.Interview = Interview;

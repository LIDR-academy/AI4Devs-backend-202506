"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.Position = void 0;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var Position = /** @class */ (function () {
    function Position(data) {
        var _a, _b;
        this.id = data.id;
        this.companyId = data.companyId;
        this.interviewFlowId = data.interviewFlowId;
        this.title = data.title;
        this.description = data.description;
        this.status = (_a = data.status) !== null && _a !== void 0 ? _a : 'Draft';
        this.isVisible = (_b = data.isVisible) !== null && _b !== void 0 ? _b : false;
        this.location = data.location;
        this.jobDescription = data.jobDescription;
        this.requirements = data.requirements;
        this.responsibilities = data.responsibilities;
        this.salaryMin = data.salaryMin;
        this.salaryMax = data.salaryMax;
        this.employmentType = data.employmentType;
        this.benefits = data.benefits;
        this.companyDescription = data.companyDescription;
        this.applicationDeadline = data.applicationDeadline ? new Date(data.applicationDeadline) : undefined;
        this.contactInfo = data.contactInfo;
    }
    Position.prototype.save = function () {
        return __awaiter(this, void 0, void 0, function () {
            var positionData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        positionData = {
                            companyId: this.companyId,
                            interviewFlowId: this.interviewFlowId,
                            title: this.title,
                            description: this.description,
                            status: this.status,
                            isVisible: this.isVisible,
                            location: this.location,
                            jobDescription: this.jobDescription,
                            requirements: this.requirements,
                            responsibilities: this.responsibilities,
                            salaryMin: this.salaryMin,
                            salaryMax: this.salaryMax,
                            employmentType: this.employmentType,
                            benefits: this.benefits,
                            companyDescription: this.companyDescription,
                            applicationDeadline: this.applicationDeadline,
                            contactInfo: this.contactInfo
                        };
                        if (!this.id) return [3 /*break*/, 2];
                        return [4 /*yield*/, prisma.position.update({
                                where: { id: this.id },
                                data: positionData
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, prisma.position.create({
                            data: positionData
                        })];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Position.findOne = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.position.findUnique({
                            where: { id: id }
                        })];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, null];
                        return [2 /*return*/, new Position(data)];
                }
            });
        });
    };
    Position.findActivePositions = function (page, limit) {
        if (page === void 0) { page = 1; }
        if (limit === void 0) { limit = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var skip, total, positionsData, positions, totalPages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        skip = (page - 1) * limit;
                        return [4 /*yield*/, prisma.position.count({
                                where: {
                                    status: 'Open',
                                    isVisible: true
                                }
                            })];
                    case 1:
                        total = _a.sent();
                        return [4 /*yield*/, prisma.position.findMany({
                                where: {
                                    status: 'Open',
                                    isVisible: true
                                },
                                include: {
                                    company: {
                                        select: {
                                            name: true
                                        }
                                    }
                                },
                                skip: skip,
                                take: limit,
                                orderBy: {
                                    id: 'desc'
                                }
                            })];
                    case 2:
                        positionsData = _a.sent();
                        positions = positionsData.map(function (data) { return new Position(data); });
                        totalPages = Math.ceil(total / limit);
                        return [2 /*return*/, {
                                positions: positions,
                                pagination: {
                                    page: page,
                                    limit: limit,
                                    total: total,
                                    totalPages: totalPages
                                }
                            }];
                }
            });
        });
    };
    return Position;
}());
exports.Position = Position;

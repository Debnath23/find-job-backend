export declare class UsersResponseDto {
    readonly username: string;
    readonly email: string;
    readonly usersType: number;
    readonly token: string;
    readonly applyFor: ApplyForDto[];
}
export declare class ApplyForDto {
    phoneNumber: string;
    address: string;
    role: string;
    attachments: string;
    applicationStatus: string;
    readonly scheduledMeeting: ScheduledMeetingDto[];
}
export declare class ScheduledMeetingDto {
    scheduledTime: string;
    meetingLink: string;
}
//# sourceMappingURL=usersResponse.dto.d.ts.map
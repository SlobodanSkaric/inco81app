import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { RequestlogService } from "src/modules/requestlog/requestlog.service";

@Injectable()
export class FingerprintGuard implements CanActivate {

    constructor(private readonly requestLogServices: RequestlogService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const userId = req.userIdreq;
        console.log(userId);
        const fingerprint = req.fingerprint;
        if (userId && fingerprint) {
            this.requestLogServices.logRequest(userId, fingerprint).catch(err => {
                console.error("Failed to log request fingerprint:", err);
            });
        }
        
        const n = Number(process.env.REDIS_RECENT_COUNT ?? 10);
        const recent = await this.requestLogServices.loadLogs(userId);
        const riskScore = this.calculateRiskScore(recent, fingerprint);


        const soft = Number(process.env.FP_SOFT_THRESHOLD ?? 30);
        const hard = Number(process.env.FP_HARD_THRESHOLD ?? 70);

        if(riskScore >= soft){
            console.warn(`FingerprintGuard: Risk score ${riskScore} exceeds soft threshold ${soft} for user ${userId}`);
        }


        if(riskScore >= hard){
            console.error(`FingerprintGuard: Risk score ${riskScore} exceeds hard threshold ${hard} for user ${userId}. Access denied.`);
            throw new ForbiddenException("Access denied due to suspicious activity.");
        }

        return true;
       
    }

    private calculateRiskScore(recentFingerprints: any[], currentFingerprint: any): number {
        let score = 0;
        const prev = recentFingerprints[0];

        if(prev){
            if(prev.ip !== currentFingerprint.ip) score += 45;
            if(prev.userAgent !== currentFingerprint.userAgent) score += 30;
            if(prev.acceptLenguage !== currentFingerprint.acceptLenguage) score += 15;
            if(prev.deviceFingerprint !== currentFingerprint.deviceFingerprint) score += 10;
        }

        const uniqueIps = new Set(recentFingerprints.map(result => result.ip));
        if(uniqueIps.size > 3) score += 20;

        if(recentFingerprints.length >=10){
            const olderTs = recentFingerprints[recentFingerprints.length -1]?.ts ?? Date.now();
            if(currentFingerprint.ts - olderTs < 60_000) score += 20;
        }

        return score;
    }
}
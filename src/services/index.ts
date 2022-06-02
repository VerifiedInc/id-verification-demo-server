import { Application } from '../declarations';
import AuthService from './auth/auth.service';
import EligibilityService from './eligibility/eligibility.service';
import GetAuthPathService from './getAuthPath/getAuthPath.service';
import GetAuthUrlService from './getAuthUrl/getAuthUrl.service';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export default function (app: Application): void {
    app.configure(AuthService);
    app.configure(GetAuthUrlService);
    app.configure(GetAuthPathService);
    app.configure(EligibilityService);
}

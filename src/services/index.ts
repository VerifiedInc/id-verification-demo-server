import { Application } from '../declarations';
import AuthService from './auth/auth.service';
import EligibilityService from './eligibility/eligibility.service';
import GetAuthPathService from './getAuthPath/getAuthPath.service';
import GetAuthUrlService from './getAuthUrl/getAuthUrl.service';
import IdentityService from './identity/identity.service';
import UserService from './user/user.service';
import UserEntityService from './userEntity/userEntity.service';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export default function (app: Application): void {
    app.configure(AuthService);
    app.configure(UserEntityService);
    app.configure(UserService);
    app.configure(GetAuthUrlService);
    app.configure(GetAuthPathService);
    app.configure(EligibilityService);
    app.configure(IdentityService);
    
}

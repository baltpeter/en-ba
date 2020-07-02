import AffinityHTMLCheck from './AffinityHTMLCheck';
import AffinityJSCheck from './AffinityJSCheck';
import AllowPopupsHTMLCheck from './AllowPopupHTMLCheck';
import AuxclickHTMLCheck from './AuxclickHTMLCheck';
import AuxclickJSCheck from './AuxclickJSCheck';
import BlinkFeaturesHTMLCheck from './BlinkFeaturesHTMLCheck';
import BlinkFeaturesJSCheck from './BlinkFeaturesJSCheck';
import CertificateErrorEventJSCheck from './CertificateErrorEventJSCheck';
import CertificateVerifyProcJSCheck from './CertificateVerifyProcJSCheck';
import ContextIsolationJSCheck from './ContextIsolationJSCheck';
import CSPHTMLCheck from './CSPHTMLCheck';
import CSPJSCheck from './CSPJSCheck';
import CustomArgumentsJSCheck from './CustomArgumentsJSCheck';
import CustomArgumentsJSONCheck from './CustomArgumentsJSONCheck';
import DangerousFunctionsJSCheck from './DangerousFunctionsJSCheck';
import ElectronVersionJSONCheck from './ElectronVersionJSONCheck';
import ExperimentalFeaturesHTMLCheck from './ExperimentalFeaturesHTMLCheck';
import ExperimentalFeaturesJSCheck from './ExperimentalFeaturesJSCheck';
import HTTPResourcesHTMLCheck from './HTTPResourcesHTMLCheck';
import HTTPResourcesJSCheck from './HTTPResourcesJSCheck';
import InsecureContentHTMLCheck from './InsecureContentHTMLCheck';
import InsecureContentJSCheck from './InsecureContentJSCheck';
import LimitNavigationJSCheck from './LimitNavigationJSCheck';
import NodeIntegrationHTMLCheck from './NodeIntegrationHTMLCheck';
import NodeIntegrationJSCheck from './NodeIntegrationJSCheck';
import NodeIntegrationAttachEventJSCheck from './NodeIntegrationAttachEventJSCheck';
import OpenExternalJSCheck from './OpenExternalJSCheck';
import PermissionRequestHandlerJSCheck from './PermissionRequestHandlerJSCheck';
import RemoteModuleJSCheck from './RemoteModuleJSCheck';
import SandboxJSCheck from './SandboxJSCheck';
import SecurityWarningsDisabledJSCheck from './SecurityWarningsDisabledJSCheck';
import SecurityWarningsDisabledJSONCheck from './SecurityWarningsDisabledJSONCheck';
import PreloadJSCheck from './PreloadJSCheck';
import ProtocolHandlersJSCheck from './ProtocolHandlersJSCheck';
import WebSecurityHTMLCheck from './WebSecurityHTMLCheck';
import WebSecurityJSCheck from './WebSecurityJSCheck';

import UserProvidedHtmlJSCheck from './UserProvidedHtmlJSCheck';
import UserProvidedCodeExecutionJSCheck from './UserProvidedCodeExecutionJSCheck';
import DevToolsJSCheck from './DevToolsJSCheck';
import LoadedWebsitesJSCheck from './LoadedWebsitesJSCheck';

const CHECKS = [
    AffinityHTMLCheck,
    AffinityJSCheck,
    AllowPopupsHTMLCheck,
    AuxclickHTMLCheck,
    AuxclickJSCheck,
    BlinkFeaturesHTMLCheck,
    BlinkFeaturesJSCheck,
    CertificateErrorEventJSCheck,
    CertificateVerifyProcJSCheck,
    ContextIsolationJSCheck,
    CSPHTMLCheck,
    CSPJSCheck,
    CustomArgumentsJSCheck,
    CustomArgumentsJSONCheck,
    DangerousFunctionsJSCheck,
    ElectronVersionJSONCheck,
    ExperimentalFeaturesJSCheck,
    ExperimentalFeaturesHTMLCheck,
    HTTPResourcesHTMLCheck,
    HTTPResourcesJSCheck,
    InsecureContentHTMLCheck,
    InsecureContentJSCheck,
    LimitNavigationJSCheck,
    NodeIntegrationHTMLCheck,
    NodeIntegrationJSCheck,
    NodeIntegrationAttachEventJSCheck,
    OpenExternalJSCheck,
    PermissionRequestHandlerJSCheck,
    RemoteModuleJSCheck,
    SandboxJSCheck,
    SecurityWarningsDisabledJSCheck,
    SecurityWarningsDisabledJSONCheck,
    PreloadJSCheck,
    ProtocolHandlersJSCheck,
    WebSecurityHTMLCheck,
    WebSecurityJSCheck,

    UserProvidedHtmlJSCheck,
    UserProvidedCodeExecutionJSCheck,
    DevToolsJSCheck,
    LoadedWebsitesJSCheck,
];

module.exports.CHECKS = CHECKS;

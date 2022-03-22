//setting up variables
window._config = {
    cognito: {
        region: 'us-east-1', // e.g. us-east-2
        UserPoolId: 'us-east-1_eGhvBZwP7', // e.g. us-east-2_uXboG5pAb
        UserPoolClientId: '76vr4ebt8h177m9fu7fhlc8oqu', // e.g. 25ddkmj4v6hfsfvruhpfi7n4hv
        IdentityPoolId: 'us-east-1:a9c89d6a-0893-4f15-b53e-94b471f98a79', // e.g. us-east-1:67282436-6f5d-4912-835d-6e919edd51b6
    },
    api: {
        ManagementId: 'bhnqwo6vm3'
    },
    DeploymentID: 'm4mcz1ofnn',
};
_config.cognito.Logins = `cognito-idp.${_config.cognito.region}.amazonaws.com/${_config.cognito.UserPoolId}`
_config.api.ManagementUrl = `https://${_config.api.ManagementId}.execute-api.${_config.cognito.region}.amazonaws.com/prod/`
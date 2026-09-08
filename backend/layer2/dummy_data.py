SMB_STATIC_FILES = {
    "employee_payroll_2026.csv": (
        "EMP_ID,NAME,DEPARTMENT,BANK_ACC,SALARY_INR,PAN\n"
        "EMP001,Rajesh Kumar,Operations,XXXXXX4921,85000,ABCDE1234F\n"
        "EMP002,Sneha Nair,Finance,XXXXXX9924,120000,BKRPN5541L\n"
        "EMP003,Arun Mathew,Engineering,XXXXXX1102,95000,ZXCVB9981K\n"
        "EMP004,Pooja Sharma,Executive,XXXXXX3391,240000,MNBVC3321Q\n"
        "# CANARY_TOKEN: canary_token_payroll_beacon_active_9912"
    ),
    "vendor_disbursements.json": (
        "{\n"
        '  "pending_transfers": [\n'
        '    {"vendor": "Apex Cloud Infra", "amount_inr": 485000, "status": "PENDING_APPROVAL", "beneficiary_ifsc": "HDFC0001234"},\n'
        '    {"vendor": "Kochi Logix Hub", "amount_inr": 124000, "status": "QUEUED", "beneficiary_ifsc": "SBIN0004567"}\n'
        "  ],\n"
        '  "canary_meta": "token_disbursement_flag_active_881"\n'
        "}"
    ),
    "aws_s3_keys.env": (
        "AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\n"
        "AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n"
        "S3_BUCKET_NAME=corp-confidential-backups-internal\n"
        "# CANARY: canary_aws_leak_triggered_4410"
    ),
    "db_backup_config.yaml": (
        "database:\n"
        "  host: 10.0.4.12\n"
        "  port: 5432\n"
        "  username: postgres_admin\n"
        "  password: ProdPassword2026!Enc\n"
        "  canary_id: canary_db_hook_9941\n"
    )
}

STATIC_FILES = SMB_STATIC_FILES
# backend/layer2/dummy_data.py

DECOY_FILE_SYSTEM = {
    "/company_share/finance": [
        {"name": "employee_payroll_2026.csv", "size": "142 KB", "type": "csv"},
        {"name": "vendor_disbursements.json", "size": "34 KB", "type": "json"},
        {"name": "tax_filings_q2.pdf", "size": "1.8 MB", "type": "pdf"}
    ],
    "/company_share/engineering": [
        {"name": "aws_backup_credentials.env", "size": "1.2 KB", "type": "env"},
        {"name": "db_connection_pool.conf", "size": "3.4 KB", "type": "conf"}
    ]
}

DUMMY_FILE_CONTENTS = {
    "employee_payroll_2026.csv": (
        "EmpID,Name,Designation,Bank,Account_Number,IFSC,Net_Salary\n"
        "EMP101,Rajesh Menon,Finance Director,HDFC Bank,501009182312,HDFC0000124,₹1,85,000\n"
        "EMP102,Sneha Nair,Operations Lead,ICICI Bank,001201582910,ICIC0000012,₹1,20,000\n"
        "EMP103,Arun Kumar,Systems Admin,SBI,30918291029,SBIN0001290,₹95,000\n"
        "# CANARY_TOKEN: cnry_payroll_leak_44a9"
    ),
    "vendor_disbursements.json": (
        "[\n"
        '  {"vendor": "Apex Logistics Pvt Ltd", "account": "98127391823", "ifsc": "YESB0000192", "balance_due": "₹12,40,000", "canary": "cnry_apex_77"},\n'
        '  {"vendor": "CloudScale Hosting Services", "account": "22910293810", "ifsc": "UTIB0000412", "balance_due": "₹4,15,000", "canary": "cnry_cloud_12"}\n'
        "]"
    ),
    "tax_filings_q2.pdf": (
        "[PDF-BINARY-SIMULATION: Internal Corporate Tax Filings Q2 2026 - Auditor Verified]\n"
        "Canary Anchor: cnry_gst_audit_019"
    ),
    "aws_backup_credentials.env": (
        "AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\n"
        "AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n"
        "# CANARY_ENDPOINT: https://canary.ghostgrid.internal/trace?id=aws_prod_99"
    ),
    "db_connection_pool.conf": (
        "DB_HOST=prod-cluster-primary.internal.smb\n"
        "DB_PORT=5432\n"
        "DB_USER=master_dba\n"
        "DB_PASS=Sup3rS3cur3P@ss2026!\n"
        "CANARY_SIG=cnry_db_auth_881"
    )
}
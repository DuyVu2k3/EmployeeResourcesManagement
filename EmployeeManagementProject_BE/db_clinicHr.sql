IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260624175843_InitialFullSchema'
)
BEGIN
    CREATE TABLE [DecisionTemplates] (
        [Id] uniqueidentifier NOT NULL,
        [Title] nvarchar(max) NOT NULL,
        [ContentTemplate] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_DecisionTemplates] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260624175843_InitialFullSchema'
)
BEGIN
    CREATE TABLE [Employees] (
        [Id] int NOT NULL IDENTITY,
        [EmployeeCode] nvarchar(max) NOT NULL,
        [FullName] nvarchar(max) NOT NULL,
        [Gender] nvarchar(max) NULL,
        [DateOfBirth] datetime2 NULL,
        [IdentityNumber] nvarchar(max) NOT NULL,
        [IdentityIssueDate] datetime2 NULL,
        [IdentityIssuePlace] nvarchar(max) NULL,
        [PermanentAddress] nvarchar(max) NULL,
        [CurrentAddress] nvarchar(max) NULL,
        [PhoneNumber] nvarchar(max) NULL,
        [Email] nvarchar(max) NULL,
        [PracticingLicenseNumber] nvarchar(max) NULL,
        [LicenseIssueDate] datetime2 NULL,
        [LicenseIssuePlace] nvarchar(max) NULL,
        [EducationLevel] nvarchar(max) NULL,
        [ProfessionalScope] nvarchar(max) NULL,
        [AdditionalCertificates] nvarchar(max) NULL,
        [NonMedicalDegrees] nvarchar(max) NULL,
        [ProfessionalTitle] nvarchar(max) NULL,
        [JobPosition] nvarchar(max) NULL,
        [Department] nvarchar(max) NULL,
        [StartDate] datetime2 NULL,
        [SocialInsuranceNumber] nvarchar(max) NULL,
        [SocialInsuranceStartDate] datetime2 NULL,
        [BankAccountNumber] nvarchar(max) NULL,
        [BankName] nvarchar(max) NULL,
        [ContractEndDate] datetime2 NULL,
        [BasicSalary] decimal(18,2) NULL,
        [Status] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_Employees] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260624175843_InitialFullSchema'
)
BEGIN
    CREATE TABLE [Users] (
        [Id] int NOT NULL IDENTITY,
        [Username] nvarchar(max) NOT NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [Role] nvarchar(max) NOT NULL,
        [EmployeeCode] nvarchar(max) NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260624175843_InitialFullSchema'
)
BEGIN
    CREATE TABLE [EmployeeDocuments] (
        [Id] int NOT NULL IDENTITY,
        [EmployeeId] int NOT NULL,
        [DocumentName] nvarchar(max) NOT NULL,
        [DocumentType] nvarchar(max) NOT NULL,
        [FilePath] nvarchar(max) NOT NULL,
        [UploadedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_EmployeeDocuments] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_EmployeeDocuments_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260624175843_InitialFullSchema'
)
BEGIN
    CREATE INDEX [IX_EmployeeDocuments_EmployeeId] ON [EmployeeDocuments] ([EmployeeId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260624175843_InitialFullSchema'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260624175843_InitialFullSchema', N'8.0.6');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625070028_UpdateEmployeeDocumentArchitecture'
)
BEGIN
    DECLARE @var0 sysname;
    SELECT @var0 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Employees]') AND [c].[name] = N'AdditionalCertificates');
    IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [Employees] DROP CONSTRAINT [' + @var0 + '];');
    ALTER TABLE [Employees] DROP COLUMN [AdditionalCertificates];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625070028_UpdateEmployeeDocumentArchitecture'
)
BEGIN
    DECLARE @var1 sysname;
    SELECT @var1 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Employees]') AND [c].[name] = N'NonMedicalDegrees');
    IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [Employees] DROP CONSTRAINT [' + @var1 + '];');
    ALTER TABLE [Employees] DROP COLUMN [NonMedicalDegrees];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625070028_UpdateEmployeeDocumentArchitecture'
)
BEGIN
    DECLARE @var2 sysname;
    SELECT @var2 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[EmployeeDocuments]') AND [c].[name] = N'DocumentType');
    IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [EmployeeDocuments] DROP CONSTRAINT [' + @var2 + '];');
    ALTER TABLE [EmployeeDocuments] ALTER COLUMN [DocumentType] int NOT NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625070028_UpdateEmployeeDocumentArchitecture'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260625070028_UpdateEmployeeDocumentArchitecture', N'8.0.6');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260627025151_AddRefreshTokenToUser'
)
BEGIN
    ALTER TABLE [Users] ADD [RefreshToken] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260627025151_AddRefreshTokenToUser'
)
BEGIN
    ALTER TABLE [Users] ADD [RefreshTokenExpiryTime] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260627025151_AddRefreshTokenToUser'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260627025151_AddRefreshTokenToUser', N'8.0.6');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260627082129_AddGraduationYear'
)
BEGIN
    ALTER TABLE [Employees] ADD [GraduationYear] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260627082129_AddGraduationYear'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260627082129_AddGraduationYear', N'8.0.6');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260708094007_AddRolePermissions'
)
BEGIN
    CREATE TABLE [SystemRoles] (
        [Id] int NOT NULL IDENTITY,
        [RoleName] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NULL,
        CONSTRAINT [PK_SystemRoles] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260708094007_AddRolePermissions'
)
BEGIN
    CREATE TABLE [FieldPermissions] (
        [Id] int NOT NULL IDENTITY,
        [SystemRoleId] int NOT NULL,
        [TableName] nvarchar(max) NOT NULL,
        [FieldName] nvarchar(max) NOT NULL,
        [CanView] bit NOT NULL,
        CONSTRAINT [PK_FieldPermissions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_FieldPermissions_SystemRoles_SystemRoleId] FOREIGN KEY ([SystemRoleId]) REFERENCES [SystemRoles] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260708094007_AddRolePermissions'
)
BEGIN
    CREATE TABLE [RolePermissions] (
        [Id] int NOT NULL IDENTITY,
        [SystemRoleId] int NOT NULL,
        [ModuleName] nvarchar(max) NOT NULL,
        [CanView] bit NOT NULL,
        [CanCreate] bit NOT NULL,
        [CanEdit] bit NOT NULL,
        [CanDelete] bit NOT NULL,
        CONSTRAINT [PK_RolePermissions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RolePermissions_SystemRoles_SystemRoleId] FOREIGN KEY ([SystemRoleId]) REFERENCES [SystemRoles] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260708094007_AddRolePermissions'
)
BEGIN
    CREATE INDEX [IX_FieldPermissions_SystemRoleId] ON [FieldPermissions] ([SystemRoleId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260708094007_AddRolePermissions'
)
BEGIN
    CREATE INDEX [IX_RolePermissions_SystemRoleId] ON [RolePermissions] ([SystemRoleId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260708094007_AddRolePermissions'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260708094007_AddRolePermissions', N'8.0.6');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260709095543_UpdateSalaryType'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260709095543_UpdateSalaryType', N'8.0.6');
END;
GO

COMMIT;
GO


import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Modal } from '../components/Modal';

export function AccountSettings({ onNavigate }) {
  const { user, updateProfile, isAdmin } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('profile');

  // Profile state
  const [fullName, setFullName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState([]);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState(null);

  // Team Members state
  const [teamMembers, setTeamMembers] = useState([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Analyst');
  const [inviteTitle, setInviteTitle] = useState('Security Analyst');

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setTitle(user.title || '');
      setEmail(user.email || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const loadApiKeys = async () => {
    try {
      const keys = await api.getApiKeys();
      setApiKeys(keys || []);
    } catch (err) {
      console.error('Error fetching API keys:', err);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const members = await api.getTeamMembers();
      setTeamMembers(members || []);
    } catch (err) {
      console.error('Error fetching team members:', err);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const logs = await api.getAuditLogs();
      setAuditLogs(logs || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'api') loadApiKeys();
    if (activeSubTab === 'team') loadTeamMembers();
    if (activeSubTab === 'audit') loadAuditLogs();
  }, [activeSubTab]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateProfile({ name: fullName, title, email, avatar_url: avatarUrl });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    try {
      const res = await api.generateApiKey(newKeyName.trim());
      setGeneratedKey(res.api_key);
      loadApiKeys();
    } catch (err) {
      alert(err.message || 'Key generation failed');
    }
  };

  const handleRevokeKey = async (id) => {
    if (confirm('Revoke this API access key? Any automated pipeline using it will fail.')) {
      await api.revokeApiKey(id);
      loadApiKeys();
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    try {
      await api.inviteMember({
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
        title: inviteTitle
      });
      setIsInviteModalOpen(false);
      setInviteName('');
      setInviteEmail('');
      loadTeamMembers();
    } catch (err) {
      alert(err.message || 'Invitation failed');
    }
  };

  const handleUpdateRole = async (memberId, role) => {
    try {
      await api.updateMemberRole(memberId, role);
      loadTeamMembers();
    } catch (err) {
      alert(err.message || 'Role change failed');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (confirm('Remove this user from the organization?')) {
      try {
        await api.removeMember(memberId);
        loadTeamMembers();
      } catch (err) {
        alert(err.message || 'Removal failed');
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-full max-w-container-max mx-auto p-lg lg:p-xl gap-xl">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between w-full border-b border-outline-variant/20 pb-md gap-md">
        <div className="flex flex-col gap-xs">
          <h1 className="font-headline-xl text-headline-xl text-on-background font-bold m-0">
            Settings & Administration
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant m-0">
            Manage your account preferences, API access tokens, and team permissions.
          </p>
        </div>

        {activeSubTab === 'profile' && (
          <div className="flex items-center gap-sm">
            {profileSaved && (
              <span className="text-xs text-tertiary font-semibold flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Saved
              </span>
            )}
            <button
              onClick={handleSaveProfile}
              className="bg-secondary-container hover:bg-secondary-fixed transition-colors text-on-secondary-container font-label-caps text-label-caps px-md py-sm rounded-lg flex items-center gap-xs font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-xl w-full">
        {/* Internal Sub-Navigation */}
        <nav className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-xs" aria-label="Settings Navigation">
          {[
            { id: 'profile', label: 'Profile Information', icon: 'person' },
            { id: 'api', label: 'API Access Keys', icon: 'key' },
            { id: 'team', label: 'Team Members', icon: 'group' },
            { id: 'audit', label: 'Audit Trail Logs', icon: 'receipt_long' },
            { id: 'alerts', label: 'Alert Preferences', icon: 'notifications_active', action: () => onNavigate('alert-settings') }
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.action) tab.action();
                  else setActiveSubTab(tab.id);
                }}
                className={`w-full text-left px-md py-sm rounded-lg flex items-center gap-sm transition-colors ${
                  isActive
                    ? 'bg-surface-container-high text-on-surface border-l-4 border-secondary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface border-l-4 border-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  {tab.icon}
                </span>
                <span className="font-body-md text-sm">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col min-w-0">
          {/* 1. PROFILE TAB */}
          {activeSubTab === 'profile' && (
            <section className="flex flex-col gap-lg animate-in fade-in">
              <div className="flex flex-col gap-xs mb-md">
                <h2 className="font-headline-lg text-headline-lg text-on-background m-0 flex items-center gap-sm font-bold">
                  <span className="w-2 h-6 bg-secondary block rounded-sm" /> Profile Information
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant m-0">
                  Update your personal details and security analyst credentials.
                </p>
              </div>

              <div className="bg-surface-container-low rounded-xl p-lg flex flex-col gap-xl border border-outline-variant/20 shadow-sm">
                {/* Avatar Section */}
                <div className="flex items-center gap-lg">
                  <div className="relative group">
                    <img
                      className="w-20 h-20 rounded-full object-cover border-2 border-outline-variant group-hover:border-secondary transition-colors"
                      alt={user?.name || 'Avatar'}
                      src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'}
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <button
                      onClick={() => {
                        const randomSeed = Math.random().toString(36).substring(7);
                        setAvatarUrl(`https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`);
                      }}
                      className="bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-caps text-label-caps px-md py-sm rounded transition-colors border border-outline-variant"
                    >
                      Generate Cyber Avatar
                    </button>
                    <p className="font-body-md text-[12px] text-on-surface-variant m-0">
                      Standard RGB Security Analyst Badge
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-caps text-label-caps text-on-surface-variant">FULL NAME</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-surface-container border border-outline-variant/40 rounded px-md py-sm font-body-md text-on-background focus:outline-none focus:border-secondary"
                    />
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="font-label-caps text-label-caps text-on-surface-variant">ROLE / TITLE</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-surface-container border border-outline-variant/40 rounded px-md py-sm font-body-md text-on-background focus:outline-none focus:border-secondary"
                    />
                  </div>

                  <div className="flex flex-col gap-xs md:col-span-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-surface-container border border-outline-variant/40 rounded px-md py-sm font-body-md text-on-background focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 2. API KEYS TAB */}
          {activeSubTab === 'api' && (
            <section className="flex flex-col gap-lg animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-md">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-background m-0 flex items-center gap-sm font-bold">
                    <span className="w-2 h-6 bg-tertiary block rounded-sm" /> API Access Keys
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant m-0">
                    Manage programmatic access tokens for CI/CD pipelines and external scanners.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setGeneratedKey(null);
                    setNewKeyName('');
                    setIsKeyModalOpen(true);
                  }}
                  className="bg-secondary text-on-secondary hover:bg-secondary-fixed text-xs font-label-caps uppercase px-md py-sm rounded-lg flex items-center gap-xs shadow-sm font-semibold whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span> Generate New Key
                </button>
              </div>

              <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden flex flex-col">
                <div className="p-md border-b border-outline-variant/20 flex justify-between items-center bg-surface-container/50">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">ACTIVE TOKENS</span>
                  <span className="font-code-sm text-xs text-on-surface-variant">{apiKeys.length} tokens active</span>
                </div>

                <div className="divide-y divide-outline-variant/10">
                  {apiKeys.length === 0 ? (
                    <div className="p-xl text-center text-on-surface-variant text-xs">
                      No active API keys found.
                    </div>
                  ) : (
                    apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="p-md flex items-center justify-between gap-md hover:bg-surface-container/40 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-sm">
                            <span className="font-headline-sm text-sm font-semibold text-on-surface">{key.name}</span>
                            <span className="bg-tertiary/10 text-tertiary px-1.5 py-0.5 rounded text-[10px] font-label-caps border border-tertiary/20">
                              ACTIVE
                            </span>
                          </div>
                          <p className="font-code-sm text-xs text-on-surface-variant mt-1">
                            Prefix: <span className="text-secondary">{key.key_prefix}</span> &bull; Created: {new Date(key.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <button
                          onClick={() => handleRevokeKey(key.id)}
                          className="px-sm py-1 rounded bg-error/10 hover:bg-error/20 text-error text-xs font-label-caps transition-colors border border-error/20"
                        >
                          Revoke
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}

          {/* 3. TEAM MEMBERS TAB (ADMIN) */}
          {activeSubTab === 'team' && (
            <section className="flex flex-col gap-lg animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-md">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-background m-0 flex items-center gap-sm font-bold">
                    <span className="w-2 h-6 bg-secondary block rounded-sm" /> Team Administration
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant m-0">
                    Manage security analyst accounts and role-based access permissions.
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="bg-secondary text-on-secondary hover:bg-secondary-fixed text-xs font-label-caps uppercase px-md py-sm rounded-lg flex items-center gap-xs shadow-sm font-semibold whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span> Invite Member
                  </button>
                )}
              </div>

              <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden flex flex-col">
                <div className="grid grid-cols-12 gap-md p-md bg-surface-container text-on-surface-variant font-label-caps text-label-caps border-b border-outline-variant/20">
                  <div className="col-span-5">Member</div>
                  <div className="col-span-3">Role</div>
                  <div className="col-span-4 text-right">Actions</div>
                </div>

                <div className="divide-y divide-outline-variant/10">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="grid grid-cols-12 gap-md p-md items-center hover:bg-surface-container/40 transition-colors"
                    >
                      <div className="col-span-5 flex items-center gap-sm">
                        <img
                          src={member.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover border border-outline-variant/30"
                        />
                        <div>
                          <p className="text-xs font-semibold text-on-surface">{member.name}</p>
                          <p className="text-[11px] text-on-surface-variant">{member.email}</p>
                        </div>
                      </div>

                      <div className="col-span-3">
                        {isAdmin ? (
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                            className="bg-surface-container border border-outline-variant/30 rounded px-2 py-1 text-xs text-on-surface font-semibold focus:outline-none"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Analyst">Analyst</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                        ) : (
                          <span className="text-xs font-code-sm text-secondary font-semibold">
                            {member.role}
                          </span>
                        )}
                      </div>

                      <div className="col-span-4 text-right">
                        {isAdmin && member.id !== user?.id && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-xs text-error hover:text-red-400 font-label-caps uppercase"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 4. AUDIT LOGS TAB */}
          {activeSubTab === 'audit' && (
            <section className="flex flex-col gap-lg animate-in fade-in">
              <div className="flex flex-col gap-xs mb-md">
                <h2 className="font-headline-lg text-headline-lg text-on-background m-0 flex items-center gap-sm font-bold">
                  <span className="w-2 h-6 bg-primary block rounded-sm" /> Audit Trail Logs
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant m-0">
                  Immutable audit records of all scans, security setting modifications, and user actions.
                </p>
              </div>

              <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden flex flex-col">
                <div className="grid grid-cols-12 gap-md p-md bg-surface-container text-on-surface-variant font-label-caps text-label-caps border-b border-outline-variant/20">
                  <div className="col-span-3">Action</div>
                  <div className="col-span-3">User</div>
                  <div className="col-span-4">Details</div>
                  <div className="col-span-2 text-right">Timestamp</div>
                </div>

                <div className="divide-y divide-outline-variant/10 max-h-[500px] overflow-y-auto">
                  {auditLogs.length === 0 ? (
                    <div className="p-xl text-center text-on-surface-variant text-xs">
                      No audit log entries recorded.
                    </div>
                  ) : (
                    auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="grid grid-cols-12 gap-md p-md items-center hover:bg-surface-container/30 text-xs font-code-sm"
                      >
                        <div className="col-span-3 text-secondary font-semibold truncate">
                          {log.action}
                        </div>
                        <div className="col-span-3 text-on-surface truncate">
                          {log.user_name} ({log.user_role})
                        </div>
                        <div className="col-span-4 text-on-surface-variant truncate" title={log.details}>
                          {log.details}
                        </div>
                        <div className="col-span-2 text-right text-on-surface-variant/70 text-[10px]">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Generate API Key Modal */}
      <Modal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        title="Generate New API Access Key"
      >
        {generatedKey ? (
          <div className="space-y-md">
            <div className="p-md bg-surface-container-lowest border border-tertiary/40 rounded-xl">
              <p className="text-xs text-tertiary font-semibold mb-1">
                Token Generated Successfully! Copy it now (will not be displayed again):
              </p>
              <p className="font-code-sm text-xs text-secondary break-all bg-surface-container p-2 rounded select-all">
                {generatedKey}
              </p>
            </div>
            <button
              onClick={() => setIsKeyModalOpen(false)}
              className="w-full py-sm bg-secondary text-on-secondary rounded-lg font-label-caps text-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleGenerateKey} className="space-y-md">
            <div>
              <label className="block text-xs font-label-caps text-on-surface-variant mb-1">
                Token Name or Pipeline Description
              </label>
              <input
                type="text"
                required
                placeholder="e.g. GitHub Actions Production Deploy"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-md py-sm font-body-md text-xs text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>
            <div className="flex justify-end gap-sm">
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(false)}
                className="px-md py-sm text-on-surface-variant text-xs font-label-caps"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-lg py-sm bg-secondary text-on-secondary rounded-lg text-xs font-label-caps shadow-sm"
              >
                Create Key
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
      >
        <form onSubmit={handleInviteMember} className="space-y-md">
          <div>
            <label className="block text-xs font-label-caps text-on-surface-variant mb-1">Full Name</label>
            <input
              type="text"
              required
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-md py-sm text-xs text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>

          <div>
            <label className="block text-xs font-label-caps text-on-surface-variant mb-1">Email Address</label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-md py-sm text-xs text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block text-xs font-label-caps text-on-surface-variant mb-1">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-md py-sm text-xs text-on-surface focus:outline-none focus:border-secondary"
              >
                <option value="Analyst">Analyst</option>
                <option value="Admin">Admin</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-label-caps text-on-surface-variant mb-1">Title</label>
              <input
                type="text"
                value={inviteTitle}
                onChange={(e) => setInviteTitle(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-md py-sm text-xs text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-sm pt-md border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-md py-sm text-on-surface-variant text-xs font-label-caps"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-lg py-sm bg-secondary text-on-secondary rounded-lg text-xs font-label-caps shadow-sm"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AccountSettings;

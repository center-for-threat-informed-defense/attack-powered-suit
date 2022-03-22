import Fuse from 'fuse.js';

const options = {
    includeMatches: true,
    distance: 1000,
    threshold: 0.1,
    ignoreFieldNorm: true,
    minMatchCharLength: 3,
    keys: [
        {
            name: "id",
            weight: 3,
        },
        {
            name: "name",
            weight: 2,
        },
        {
            name: "description",
            weight: 1,
        },
        {
            name: "type",
            weight: 0.1,
        },
        {
            name: "deprecated",
            weight: 0.1,
        }
    ],
}

const list = [
    {
        "id": "T1003.008",
        "type": "subtechnique",
        "deprecated": false,
        "name": "/etc/passwd and /etc/shadow",
        "description": "Adversaries may attempt to dump the contents of <code>/etc/passwd</code> and <code>/etc/shadow</code> to enable offline password cracking. Most modern Linux operating systems use a combination of <code>/etc/passwd</code> and <code>/etc/shadow</code> to store user account information including password hashes in <code>/etc/shadow</code>. By default, <code>/etc/shadow</code> is only readable by the root user.(Citation: Linux Password and Shadow File Formats)\n\nThe Linux utility, unshadow, can be used to combine the two files in a format suited for password cracking utilities such as John the Ripper:(Citation: nixCraft - John the Ripper) <code># /usr/bin/unshadow /etc/passwd /etc/shadow > /tmp/crack.password.db</code>\n",
        "url": "https://attack.mitre.org/techniques/T1003/008"
    },
    {
        "id": "T1557.002",
        "type": "subtechnique",
        "deprecated": false,
        "name": "ARP Cache Poisoning",
        "description": "Adversaries may poison Address Resolution Protocol (ARP) caches to position themselves between the communication of two or more networked devices. This activity may be used to enable follow-on behaviors such as [Network Sniffing](https://attack.mitre.org/techniques/T1040) or [Transmitted Data Manipulation](https://attack.mitre.org/techniques/T1565/002).\n\nThe ARP protocol is used to resolve IPv4 addresses to link layer addresses, such as a media access control (MAC) address.(Citation: RFC826 ARP) Devices in a local network segment communicate with each other by using link layer addresses. If a networked device does not have the link layer address of a particular networked device, it may send out a broadcast ARP request to the local network to translate the IP address to a MAC address. The device with the associated IP address directly replies with its MAC address. The networked device that made the ARP request will then use as well as store that information in its ARP cache.\n\nAn adversary may passively wait for an ARP request to poison the ARP cache of the requesting device. The adversary may reply with their MAC address, thus deceiving the victim by making them believe that they are communicating with the intended networked device. For the adversary to poison the ARP cache, their reply must be faster than the one made by the legitimate IP address owner. Adversaries may also send a gratuitous ARP reply that maliciously announces the ownership of a particular IP address to all the devices in the local network segment.\n\nThe ARP protocol is stateless and does not require authentication. Therefore, devices may wrongly add or update the MAC address of the IP address in their ARP cache.(Citation: Sans ARP Spoofing Aug 2003)(Citation: Cylance Cleaver)\n\nAdversaries may use ARP cache poisoning as a means to intercept network traffic. This activity may be used to collect and/or relay data such as credentials, especially those sent over an insecure, unencrypted protocol.(Citation: Sans ARP Spoofing Aug 2003)\n",
        "url": "https://attack.mitre.org/techniques/T1557/002"
    },
    {
        "id": "T1558.004",
        "type": "subtechnique",
        "deprecated": false,
        "name": "AS-REP Roasting",
        "description": "Adversaries may reveal credentials of accounts that have disabled Kerberos preauthentication by [Password Cracking](https://attack.mitre.org/techniques/T1110/002) Kerberos messages.(Citation: Harmj0y Roasting AS-REPs Jan 2017) \n\nPreauthentication offers protection against offline [Password Cracking](https://attack.mitre.org/techniques/T1110/002). When enabled, a user requesting access to a resource initiates communication with the Domain Controller (DC) by sending an Authentication Server Request (AS-REQ) message with a timestamp that is encrypted with the hash of their password. If and only if the DC is able to successfully decrypt the timestamp with the hash of the user\u2019s password, it will then send an Authentication Server Response (AS-REP) message that contains the Ticket Granting Ticket (TGT) to the user. Part of the AS-REP message is signed with the user\u2019s password.(Citation: Microsoft Kerberos Preauth 2014)\n\nFor each account found without preauthentication, an adversary may send an AS-REQ message without the encrypted timestamp and receive an AS-REP message with TGT data which may be encrypted with an insecure algorithm such as RC4. The recovered encrypted data may be vulnerable to offline [Password Cracking](https://attack.mitre.org/techniques/T1110/002) attacks similarly to [Kerberoasting](https://attack.mitre.org/techniques/T1558/003) and expose plaintext credentials. (Citation: Harmj0y Roasting AS-REPs Jan 2017)(Citation: Stealthbits Cracking AS-REP Roasting Jun 2019) \n\nAn account registered to a domain, with or without special privileges, can be abused to list all domain accounts that have preauthentication disabled by utilizing Windows tools like [PowerShell](https://attack.mitre.org/techniques/T1059/001) with an LDAP filter. Alternatively, the adversary may send an AS-REQ message for each user. If the DC responds without errors, the account does not require preauthentication and the AS-REP message will already contain the encrypted data. (Citation: Harmj0y Roasting AS-REPs Jan 2017)(Citation: Stealthbits Cracking AS-REP Roasting Jun 2019)\n\nCracked hashes may enable [Persistence](https://attack.mitre.org/tactics/TA0003), [Privilege Escalation](https://attack.mitre.org/tactics/TA0004), and [Lateral Movement](https://attack.mitre.org/tactics/TA0008) via access to [Valid Accounts](https://attack.mitre.org/techniques/T1078).(Citation: SANS Attacking Kerberos Nov 2014)",
        "url": "https://attack.mitre.org/techniques/T1558/004"
    },
    {
        "id": "T1548",
        "type": "technique",
        "deprecated": false,
        "name": "Abuse Elevation Control Mechanism",
        "description": "Adversaries may circumvent mechanisms designed to control elevate privileges to gain higher-level permissions. Most modern systems contain native elevation control mechanisms that are intended to limit privileges that a user can perform on a machine. Authorization has to be granted to specific users in order to perform tasks that can be considered of higher risk. An adversary can perform several methods to take advantage of built-in control mechanisms in order to escalate privileges on a system.",
        "url": "https://attack.mitre.org/techniques/T1548"
    },
    {
        "id": "T1134",
        "type": "technique",
        "deprecated": false,
        "name": "Access Token Manipulation Mitigation",
        "description": "Access tokens are an integral part of the security system within Windows and cannot be turned off. However, an attacker must already have administrator level access on the local system to make full use of this technique; be sure to restrict users and accounts to the least privileges they require to do their job.\n\nAny user can also spoof access tokens if they have legitimate credentials. Follow mitigation guidelines for preventing adversary use of [Valid Accounts](https://attack.mitre.org/techniques/T1078). Limit permissions so that users and user groups cannot create tokens. This setting should be defined for the local system account only. GPO: Computer Configuration > [Policies] > Windows Settings > Security Settings > Local Policies > User Rights Assignment: Create a token object. (Citation: Microsoft Create Token) Also define who can create a process level token to only the local and network service through GPO: Computer Configuration > [Policies] > Windows Settings > Security Settings > Local Policies > User Rights Assignment: Replace a process level token. (Citation: Microsoft Replace Process Token)\n\nAlso limit opportunities for adversaries to increase privileges by limiting Privilege Escalation opportunities.",
        "url": "https://attack.mitre.org/mitigations/T1134"
    },
    {
        "id": "T1015",
        "type": "technique",
        "deprecated": false,
        "name": "Accessibility Features Mitigation",
        "description": "To use this technique remotely, an adversary must use it in conjunction with RDP. Ensure that Network Level Authentication is enabled to force the remote desktop session to authenticate before the session is created and the login screen displayed. It is enabled by default on Windows Vista and later. (Citation: TechNet RDP NLA)\n\nIf possible, use a Remote Desktop Gateway to manage connections and security configuration of RDP within a network. (Citation: TechNet RDP Gateway)\n\nIdentify and block potentially malicious software that may be executed by an adversary with this technique by using whitelisting (Citation: Beechey 2010) tools, like AppLocker, (Citation: Windows Commands JPCERT) (Citation: NSA MS AppLocker) or Software Restriction Policies (Citation: Corio 2008) where appropriate. (Citation: TechNet Applocker vs SRP)",
        "url": "https://attack.mitre.org/mitigations/T1015"
    },
    {
        "id": "T1546.008",
        "type": "subtechnique",
        "deprecated": false,
        "name": "Accessibility Features",
        "description": "Adversaries may establish persistence and/or elevate privileges by executing malicious content triggered by accessibility features. Windows contains accessibility features that may be launched with a key combination before a user has logged in (ex: when the user is on the Windows logon screen). An adversary can modify the way these programs are launched to get a command prompt or backdoor without logging in to the system.\n\nTwo common accessibility programs are <code>C:\\Windows\\System32\\sethc.exe</code>, launched when the shift key is pressed five times and <code>C:\\Windows\\System32\\utilman.exe</code>, launched when the Windows + U key combination is pressed. The sethc.exe program is often referred to as \"sticky keys\", and has been used by adversaries for unauthenticated access through a remote desktop login screen. (Citation: FireEye Hikit Rootkit)\n\nDepending on the version of Windows, an adversary may take advantage of these features in different ways. Common methods used by adversaries include replacing accessibility feature binaries or pointers/references to these binaries in the Registry. In newer versions of Windows, the replaced binary needs to be digitally signed for x64 systems, the binary must reside in <code>%systemdir%\\</code>, and it must be protected by Windows File or Resource Protection (WFP/WRP). (Citation: DEFCON2016 Sticky Keys) The [Image File Execution Options Injection](https://attack.mitre.org/techniques/T1546/012) debugger method was likely discovered as a potential workaround because it does not require the corresponding accessibility feature binary to be replaced.\n\nFor simple binary replacement on Windows XP and later as well as and Windows Server 2003/R2 and later, for example, the program (e.g., <code>C:\\Windows\\System32\\utilman.exe</code>) may be replaced with \"cmd.exe\" (or another program that provides backdoor access). Subsequently, pressing the appropriate key combination at the login screen while sitting at the keyboard or when connected over [Remote Desktop Protocol](https://attack.mitre.org/techniques/T1021/001) will cause the replaced file to be executed with SYSTEM privileges. (Citation: Tilbury 2014)\n\nOther accessibility features exist that may also be leveraged in a similar fashion: (Citation: DEFCON2016 Sticky Keys)(Citation: Narrator Accessibility Abuse)\n\n* On-Screen Keyboard: <code>C:\\Windows\\System32\\osk.exe</code>\n* Magnifier: <code>C:\\Windows\\System32\\Magnify.exe</code>\n* Narrator: <code>C:\\Windows\\System32\\Narrator.exe</code>\n* Display Switcher: <code>C:\\Windows\\System32\\DisplaySwitch.exe</code>\n* App Switcher: <code>C:\\Windows\\System32\\AtBroker.exe</code>",
        "url": "https://attack.mitre.org/techniques/T1546/008"
    },
    {
        "id": "T1531",
        "type": "tactic",
        "deprecated": false,
        "name": "Account Access Removal",
        "description": "Adversaries may interrupt availability of system and network resources by inhibiting access to accounts utilized by legitimate users. Accounts may be deleted, locked, or manipulated (ex: changed credentials) to remove access to accounts.\n\nAdversaries may also subsequently log off and/or reboot boxes to set malicious changes into place.(Citation: CarbonBlack LockerGoga 2019)(Citation: Unit42 LockerGoga 2019)",
        "url": "https://attack.mitre.org/techniques/T1531"
    },
    {
        "id": "T1087",
        "type": "tactic",
        "deprecated": true,
        "name": "Account Discovery Mitigation",
        "description": "Prevent administrator accounts from being enumerated when an application is elevating through UAC since it can lead to the disclosure of account names. The Registry key is located <code>HKLM\\ SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\CredUI\\EnumerateAdministrators</code>. It can be disabled through GPO: Computer Configuration > [Policies] > Administrative Templates > Windows Components > Credential User Interface: E numerate administrator accounts on elevation. (Citation: UCF STIG Elevation Account Enumeration)\n\nIdentify unnecessary system utilities or potentially malicious software that may be used to acquire information about system and domain accounts, and audit and/or block them by using whitelisting (Citation: Beechey 2010) tools, like AppLocker, (Citation: Windows Commands JPCERT) (Citation: NSA MS AppLocker) or Software Restriction Policies (Citation: Corio 2008) where appropriate. (Citation: TechNet Applocker vs SRP)",
        "url": "https://attack.mitre.org/mitigations/T1087"
    },

];

const fuse = new Fuse(list, options);

/**
 * Initialize the search index.
 */
export function initializeSearch() {
}

/**
 * Run a query on the search index and return the results.
 */
export function search(query, filters) {
    const unfilteredResults = fuse.search(query);
    let filteredResults = [];

    for (const result of unfilteredResults) {
        const type = result.item.type;
        const deprecated = result.item.deprecated;
        if (filters[type] === true && (!deprecated || filters.deprecated === true)) {
            filteredResults.push(result);
        }
    }

    return filteredResults;
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Votex {
    address public admin;

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct Election {
        uint256 id;
        string name;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        mapping(uint256 => Candidate) candidates;
        uint256 candidateCount;
    }

    mapping(address => bool) public hasVoted;
    mapping(uint256 => Election) public elections;
    uint256 public electionCount;

    event ElectionCreated(uint256 electionId, string name, uint256 startTime, uint256 endTime);
    event CandidateAdded(uint256 electionId, uint256 candidateId, string name);
    event VoteCast(address indexed voter, uint256 electionId, uint256 candidateId, bytes32 voteHash);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createElection(string memory _name, uint256 _startTime, uint256 _endTime) external onlyAdmin {
        require(_startTime < _endTime, "Invalid time window");
        
        electionCount++;
        Election storage newElection = elections[electionCount];
        newElection.id = electionCount;
        newElection.name = _name;
        newElection.startTime = _startTime;
        newElection.endTime = _endTime;
        newElection.isActive = true;

        emit ElectionCreated(electionCount, _name, _startTime, _endTime);
    }

    function addCandidate(uint256 _electionId, string memory _name) external onlyAdmin {
        Election storage election = elections[_electionId];
        require(election.isActive, "Election is not active");
        
        election.candidateCount++;
        election.candidates[election.candidateCount] = Candidate({
            id: election.candidateCount,
            name: _name,
            voteCount: 0
        });

        emit CandidateAdded(_electionId, election.candidateCount, _name);
    }

    function vote(uint256 _electionId, uint256 _candidateId) external {
        require(!hasVoted[msg.sender], "Voter has already voted");
        Election storage election = elections[_electionId];
        require(election.isActive, "Election is not active");
        require(block.timestamp >= election.startTime && block.timestamp <= election.endTime, "Not in voting window");
        require(_candidateId > 0 && _candidateId <= election.candidateCount, "Invalid candidate");

        hasVoted[msg.sender] = true;
        election.candidates[_candidateId].voteCount++;

        // Generate a simple vote hash for the receipt
        bytes32 voteHash = keccak256(abi.encodePacked(msg.sender, _electionId, _candidateId, block.timestamp));
        
        emit VoteCast(msg.sender, _electionId, _candidateId, voteHash);
    }

    function getCandidate(uint256 _electionId, uint256 _candidateId) external view returns (uint256 id, string memory name, uint256 voteCount) {
        Election storage election = elections[_electionId];
        Candidate memory candidate = election.candidates[_candidateId];
        return (candidate.id, candidate.name, candidate.voteCount);
    }
}

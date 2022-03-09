//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Gemz is Ownable {
	uint256 public songsCount;

	constructor() Ownable() {
		songsCount = 0;
	}

	// enum Liked {Yes, No}

	struct Song {
		uint256 id;
		string songHash;
		string coverHash;
		string songTitle;
		string artistName;
		address payable artistAddress;
		address[] donors;
	}

	event Uploaded(address _artist, string _songHash, uint256 _songId);
	event Donate(address _artistAddress, uint256 _amount, address _donorAddr);

	mapping(uint256 => Song) songs;

	function uploadFile(
		string memory _songHash,
		string memory _coverHash,
		string memory _songTitle,
		string memory _artistName
	) public {
		require(bytes(_songHash).length > 0, "Song hash is not valid");

		songs[songsCount + 1] = Song({
			id: songsCount + 1,
			songHash: _songHash,
			coverHash: _coverHash,
			songTitle: _songTitle,
			artistName: _artistName,
			artistAddress: payable(msg.sender),
			donors: new address[](0)
		});

		songsCount++;

		emit Uploaded(msg.sender, _songHash, songsCount + 1);
	}

	function donate(uint256 id) public payable {
		require(msg.value > 0);
		address payable artist = songs[id].artistAddress;
		require(msg.sender != artist, "You cannot donate to yourself");

		(bool sent, ) = artist.call{value: msg.value}("");
		require(sent, "failed to send Ether");

		// balances[artist] += msg.value;
		songs[id].donors.push(msg.sender);

		emit Donate(artist, msg.value, msg.sender);
	}
}

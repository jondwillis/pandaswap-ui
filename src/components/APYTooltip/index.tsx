import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import Tooltip from '../Tooltip'

const Wrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.2rem;
	border: none;
	background: none;
	outline: none;
	cursor: default;
	border-radius: 36px;
	background-color: ${({ theme }) => theme.bg2};
	color: ${({ theme }) => theme.text2};

	:hover,
	:focus {
		opacity: 0.7;
	}
`

export default function APYTooltip({ element, text }: { element: React.ReactFragment; text: string }) {
	const [show, setShow] = useState<boolean>(false)

	const open = useCallback(() => setShow(true), [setShow])
	const close = useCallback(() => setShow(false), [setShow])

	return (
		<span style={{ marginLeft: 4 }}>
			<Tooltip text={text} show={show}>
				<Wrapper onClick={open} onMouseEnter={open} onMouseLeave={close}>
					{element}
				</Wrapper>
			</Tooltip>
		</span>
	)
}
